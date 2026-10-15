import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import { verifyWebhook, classifyDodoEvent, type DodoWebhookEvent } from "@/lib/dodo";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

/** Extract email / customer id / userId from the various Dodo payload shapes. */
function extractPaymentInfo(event: DodoWebhookEvent): {
  email: string | null;
  customerId: string | null;
  userId: string | null;
} {
  const data = asRecord(event.data ?? event.payload ?? event);
  const nestedCustomer = asRecord(
    data.customer ?? data.customer_info ?? event.customer,
  );
  const metadata = asRecord(
    data.metadata ?? event.metadata ?? data.meta ?? event.meta,
  );
  return {
    email: firstString(
      nestedCustomer.email,
      data.customer_email,
      data.email,
      event.customer_email,
      metadata.email,
    ),
    customerId: firstString(
      nestedCustomer.customer_id,
      nestedCustomer.id,
      data.customer_id,
      event.customer_id,
      data.customerId,
    ),
    userId: firstString(
      metadata.userId,
      metadata.user_id,
      data.userId,
      data.user_id,
      event.userId,
    ),
  };
}

/** Extract a stable event id for log correlation / manual reconcile. */
function eventIdOf(event: DodoWebhookEvent): string | null {
  const data = asRecord(event.data ?? event.payload ?? event);
  return firstString(
    event.id,
    data.id,
    data.payment_id,
    data.paymentId,
  );
}

async function resolveUserId(
  metadataUserId: string | null,
  email: string | null,
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (!email) return null;
  try {
    const rows = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  let event: DodoWebhookEvent;
  try {
    event = verifyWebhook(rawBody, req.headers);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  console.log("dodo webhook:", event.type);

  try {
    const kind = classifyDodoEvent(event.type);
    if (kind === "payment_succeeded") {
      const info = extractPaymentInfo(event);
      const userId = await resolveUserId(info.userId, info.email);
      if (!userId) {
        // Unmapped money: the payment is real but we cannot attribute it.
        // There is no webhook_events table (by design — no new table), so
        // log payment id + buyer email + event id (no secrets) and report
        // mapped:false so ops can reconcile manually in the Dodo dashboard.
        // Still 200 + received:true so Dodo stops retrying.
        const eventId = eventIdOf(event);
        console.error(
          "dodo webhook: payment.succeeded with unresolvable user " +
            `(event_id=${eventId ?? "unknown"} ` +
            `customer_id=${info.customerId ?? "unknown"} ` +
            `email=${info.email ?? "unknown"}) — manual reconcile required`,
        );
        return NextResponse.json({
          received: true,
          mapped: false,
          ...(eventId ? { event_id: eventId } : {}),
        });
      }
      await db
        .insert(subscriptions)
        .values({
          userId,
          dodoCustomerId: info.customerId,
          status: "active",
          plan: "lifetime",
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            dodoCustomerId: info.customerId,
            status: "active",
            plan: "lifetime",
          },
        });
    } else if (
      kind === "payment_failed" ||
      kind === "subscription_cancelled" ||
      kind === "refund_dispute"
    ) {
      if (kind === "refund_dispute") {
        console.error(
          `dodo webhook: ${event.type} (event_id=${eventIdOf(event) ?? "unknown"}) — deactivating subscription`,
        );
      }
      const info = extractPaymentInfo(event);
      const userId = await resolveUserId(info.userId, info.email);
      if (userId) {
        const status =
          kind === "subscription_cancelled" ? "cancelled" : "inactive";
        await db
          .insert(subscriptions)
          .values({
            userId,
            dodoCustomerId: info.customerId,
            status,
            plan: "lifetime",
          })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              dodoCustomerId: info.customerId,
              status,
            },
          });
      }
    }
  } catch (err) {
    console.error(
      "dodo webhook handling failed:",
      err instanceof Error ? err.message : "unknown",
    );
  }

  return NextResponse.json({ received: true });
}
