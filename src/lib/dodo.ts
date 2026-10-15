import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";

export type CreateProCheckoutArgs = {
  email: string;
  name?: string | null;
  userId: string;
  /** "lifetime" (one-time) by default; "monthly" needs DODO_MONTHLY_PRODUCT_ID. */
  billing?: BillingPeriod;
};

export type BillingPeriod = "lifetime" | "monthly";

/** Product id backing the ₹999 lifetime Pro checkout. */
export function getProProductId(): string {
  const id = process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;
  if (!id) {
    throw new Error(
      "NEXT_PUBLIC_DODO_PRO_PRODUCT_ID is not configured",
    );
  }
  return id;
}

/**
 * Optional product id backing the ₹199/mo recurring Pro checkout.
 * Returns null when monthly billing is not configured yet — callers must
 * treat monthly as "coming soon" instead of falling back to lifetime.
 */
export function getMonthlyProductId(): string | null {
  return process.env.NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID ?? null;
}

/** Whether the monthly (recurring) checkout is configured. */
export function isMonthlyAvailable(): boolean {
  return Boolean(getMonthlyProductId());
}

export type ResolvedCheckoutProduct = {
  productId: string;
  /** Dodo price type: one-time for lifetime, recurring for monthly. */
  priceType: "one-time" | "recurring";
  billing: BillingPeriod;
};

/**
 * Resolve which Dodo product backs a checkout. Monthly requires
 * NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID — throws monthly_unavailable
 * otherwise so the UI can show "coming soon" instead of selling
 * lifetime as monthly.
 */
export function resolveCheckoutProduct(
  billing: BillingPeriod = "lifetime",
): ResolvedCheckoutProduct {
  if (billing === "monthly") {
    const monthlyId = getMonthlyProductId();
    if (!monthlyId) {
      throw new Error(
        "monthly_unavailable: NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID is not configured",
      );
    }
    return { productId: monthlyId, priceType: "recurring", billing };
  }
  return { productId: getProProductId(), priceType: "one-time", billing };
}

function getReturnUrl(): string {
  const url = process.env.DODO_RETURN_URL;
  if (!url) {
    throw new Error("DODO_RETURN_URL is not configured");
  }
  return url;
}

function getClient(): DodoPayments {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("DODO_PAYMENTS_API_KEY is not configured");
  }
  return new DodoPayments({
    bearerToken: apiKey,
    environment: "test_mode",
  });
}

/**
 * Create a Dodo test-mode checkout session for the lifetime Pro product
 * (or the monthly recurring product when billing === "monthly").
 * Returns the hosted checkout_url the buyer must be redirected to.
 * Metadata carries our userId so the webhook can map payment -> user.
 */
export async function createProCheckout(
  args: CreateProCheckoutArgs,
): Promise<string> {
  if (!args.email) throw new Error("email is required");
  if (!args.userId) throw new Error("userId is required");
  const client = getClient();
  const resolved = resolveCheckoutProduct(args.billing ?? "lifetime");
  const productId = resolved.productId;
  const returnUrl = getReturnUrl();

  const res = await client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: returnUrl,
    customer: { email: args.email, name: args.name ?? undefined },
    metadata: { userId: args.userId, billing: resolved.billing },
  });

  if (!res.checkout_url) {
    throw new Error("Dodo did not return a checkout_url");
  }
  return res.checkout_url;
}

export type DodoWebhookEvent = {
  type: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
};

export type DodoEventClass =
  | "payment_succeeded"
  | "payment_failed"
  | "subscription_cancelled"
  | "refund_dispute"
  | "ignored";

/**
 * Classify a Dodo webhook type. Refund/dispute/chargeback variants are
 * matched defensively by substring (Dodo event names vary), so any money
 * flowing back to the buyer deactivates Pro.
 */
export function classifyDodoEvent(type: string): DodoEventClass {
  const t = (type || "").toLowerCase();
  if (t === "payment.succeeded") return "payment_succeeded";
  if (t === "subscription.cancelled") return "subscription_cancelled";
  if (t === "payment.failed") return "payment_failed";
  if (
    t.includes("refund") ||
    t.includes("dispute") ||
    t.includes("chargeback")
  ) {
    return "refund_dispute";
  }
  return "ignored";
}

function readHeader(
  headers: Record<string, string> | Headers,
  name: string,
): string {
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name) ?? "";
  }
  const record = headers as Record<string, string>;
  if (record[name] !== undefined) return record[name];
  const lower = name.toLowerCase();
  for (const key of Object.keys(record)) {
    if (key.toLowerCase() === lower) return record[key];
  }
  return "";
}

/**
 * Verify a Dodo (Standard Webhooks) payload. Throws on missing secret or
 * invalid signature. Returns the parsed event.
 */
export function verifyWebhook(
  rawBody: string,
  headers: Record<string, string> | Headers,
): DodoWebhookEvent {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("DODO_WEBHOOK_SECRET is not configured");
  }
  const wh = new Webhook(secret);
  const verified = wh.verify(rawBody, {
    "webhook-id": readHeader(headers, "webhook-id"),
    "webhook-timestamp": readHeader(headers, "webhook-timestamp"),
    "webhook-signature": readHeader(headers, "webhook-signature"),
  }) as unknown;
  if (
    !verified ||
    typeof verified !== "object" ||
    typeof (verified as { type?: unknown }).type !== "string"
  ) {
    throw new Error("Invalid webhook payload");
  }
  return verified as DodoWebhookEvent;
}
