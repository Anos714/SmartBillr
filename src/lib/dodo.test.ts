import { afterEach, describe, expect, it } from "vitest";
import { Webhook } from "standardwebhooks";

import {
  classifyDodoEvent,
  createProCheckout,
  getMonthlyProductId,
  getProProductId,
  isMonthlyAvailable,
  resolveCheckoutProduct,
  verifyWebhook,
} from "./dodo";

const ENV_KEYS = [
  "DODO_PAYMENTS_API_KEY",
  "DODO_WEBHOOK_SECRET",
  "NEXT_PUBLIC_DODO_PRO_PRODUCT_ID",
  "NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID",
  "DODO_RETURN_URL",
] as const;

const savedEnv: Record<string, string | undefined> = {};

for (const key of ENV_KEYS) {
  savedEnv[key] = process.env[key];
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

describe("dodo lib", () => {
  it("exports checkout + webhook verifiers and wires the product id", () => {
    expect(typeof createProCheckout).toBe("function");
    expect(typeof verifyWebhook).toBe("function");
    process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID = "pdt_test_123";
    expect(getProProductId()).toBe("pdt_test_123");
  });

  it("createProCheckout throws cleanly when env is missing (no network)", async () => {
    delete process.env.DODO_PAYMENTS_API_KEY;
    delete process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID;
    delete process.env.DODO_RETURN_URL;
    await expect(
      createProCheckout({ email: "a@example.com", userId: "u_1" }),
    ).rejects.toThrow(/DODO_PAYMENTS_API_KEY/);

    process.env.DODO_PAYMENTS_API_KEY = "key_test";
    await expect(
      createProCheckout({ email: "a@example.com", userId: "u_1" }),
    ).rejects.toThrow(/NEXT_PUBLIC_DODO_PRO_PRODUCT_ID/);
  });

  it("createProCheckout validates args before any network call", async () => {
    process.env.DODO_PAYMENTS_API_KEY = "key_test";
    process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID = "pdt_test_123";
    process.env.DODO_RETURN_URL = "http://localhost:3000/pricing?success=true";
    await expect(
      createProCheckout({ email: "", userId: "u_1" }),
    ).rejects.toThrow(/email is required/);
    await expect(
      createProCheckout({ email: "a@example.com", userId: "" }),
    ).rejects.toThrow(/userId is required/);
  });

  it("verifyWebhook accepts a valid signature and rejects tampering", () => {
    const secret =
      "whsec_" +
      Buffer.from("test-secret-for-unit-tests-only-12345").toString("base64");
    process.env.DODO_WEBHOOK_SECRET = secret;
    const payload = JSON.stringify({
      type: "payment.succeeded",
      data: {
        customer: { email: "buyer@example.com" },
        metadata: { userId: "u_1" },
      },
    });
    const wh = new Webhook(secret);
    const msgId = "msg_unit_test_1";
    const timestamp = new Date();
    const signature = wh.sign(msgId, timestamp, payload);
    const headers = {
      "webhook-id": msgId,
      "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "webhook-signature": signature,
    };

    const event = verifyWebhook(payload, headers);
    expect(event.type).toBe("payment.succeeded");

    expect(() =>
      verifyWebhook(payload + "tampered", headers),
    ).toThrow();
  });

  it("verifyWebhook throws when the secret is missing", () => {
    delete process.env.DODO_WEBHOOK_SECRET;
    expect(() =>
      verifyWebhook("{}", {
        "webhook-id": "x",
        "webhook-timestamp": "1",
        "webhook-signature": "y",
      }),
    ).toThrow(/DODO_WEBHOOK_SECRET/);
  });

  it("resolveCheckoutProduct gates monthly on env (no fake monthly checkout)", () => {
    process.env.NEXT_PUBLIC_DODO_PRO_PRODUCT_ID = "pdt_lifetime_1";
    delete process.env.NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID;

    expect(isMonthlyAvailable()).toBe(false);
    expect(getMonthlyProductId()).toBeNull();
    expect(resolveCheckoutProduct("lifetime")).toEqual({
      productId: "pdt_lifetime_1",
      priceType: "one-time",
      billing: "lifetime",
    });
    expect(() => resolveCheckoutProduct("monthly")).toThrow(
      /monthly_unavailable/,
    );

    process.env.NEXT_PUBLIC_DODO_MONTHLY_PRODUCT_ID = "pdt_monthly_1";
    expect(isMonthlyAvailable()).toBe(true);
    expect(resolveCheckoutProduct("monthly")).toEqual({
      productId: "pdt_monthly_1",
      priceType: "recurring",
      billing: "monthly",
    });
  });

  it("classifyDodoEvent maps refunds/disputes/chargebacks defensively", () => {
    expect(classifyDodoEvent("payment.succeeded")).toBe("payment_succeeded");
    expect(classifyDodoEvent("payment.failed")).toBe("payment_failed");
    expect(classifyDodoEvent("subscription.cancelled")).toBe(
      "subscription_cancelled",
    );
    expect(classifyDodoEvent("refund.succeeded")).toBe("refund_dispute");
    expect(classifyDodoEvent("refund.created")).toBe("refund_dispute");
    expect(classifyDodoEvent("payment.refunded")).toBe("refund_dispute");
    expect(classifyDodoEvent("dispute.opened")).toBe("refund_dispute");
    expect(classifyDodoEvent("chargeback.created")).toBe("refund_dispute");
    expect(classifyDodoEvent("payment.chargeback")).toBe("refund_dispute");
    expect(classifyDodoEvent("something.else")).toBe("ignored");
  });
});
