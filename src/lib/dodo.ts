import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";

export type CreateProCheckoutArgs = {
  email: string;
  name?: string | null;
  userId: string;
};

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
 * Create a Dodo test-mode checkout session for the lifetime Pro product.
 * Returns the hosted checkout_url the buyer must be redirected to.
 * Metadata carries our userId so the webhook can map payment -> user.
 */
export async function createProCheckout(
  args: CreateProCheckoutArgs,
): Promise<string> {
  if (!args.email) throw new Error("email is required");
  if (!args.userId) throw new Error("userId is required");
  const client = getClient();
  const productId = getProProductId();
  const returnUrl = getReturnUrl();

  const res = await client.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: returnUrl,
    customer: { email: args.email, name: args.name ?? undefined },
    metadata: { userId: args.userId },
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
