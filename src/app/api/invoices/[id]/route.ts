import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/db";
import { invoices } from "@/db/schema";
import { auth } from "@/lib/auth";
import { InvoiceSchema, type InvoiceData } from "@/lib/invoice";
import { fromRow, normalizeStatus, toRow } from "@/lib/invoice-row";
import type { InvoiceStatus } from "@/lib/library";

async function requireUserId(req: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

function isStatus(value: unknown): value is InvoiceStatus {
  return (
    value === "draft" ||
    value === "paid" ||
    value === "pending" ||
    value === "overdue"
  );
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: { invoice?: unknown; status?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (body?.invoice === undefined && body?.status === undefined) {
    return NextResponse.json({ error: "empty_update" }, { status: 400 });
  }
  let invoiceData: InvoiceData | undefined;
  if (body?.invoice !== undefined) {
    const parsed = InvoiceSchema.safeParse(body.invoice);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_invoice", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    invoiceData = parsed.data as InvoiceData;
  }
  if (body?.status !== undefined && !isStatus(body.status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);
  const row = existing[0];
  if (!row || row.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const nextStatus: InvoiceStatus = isStatus(body?.status)
    ? body.status
    : normalizeStatus(row.status);
  const now = new Date();
  const paidAt =
    nextStatus === "paid"
      ? ((row.paidAt as Date | null) ?? now)
      : null;

  const patch =
    invoiceData !== undefined
      ? {
          ...toRow(userId, invoiceData, nextStatus),
          updatedAt: now,
          paidAt,
        }
      : { status: nextStatus, updatedAt: now, paidAt };

  const updated = await db
    .update(invoices)
    .set(patch)
    .where(eq(invoices.id, id))
    .returning();
  if (!updated[0]) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(fromRow(updated[0]));
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await db
    .select({ id: invoices.id, userId: invoices.userId })
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);
  const row = existing[0];
  if (!row || row.userId !== userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  await db.delete(invoices).where(eq(invoices.id, id));
  return NextResponse.json({ ok: true });
}
