import { describe, expect, it } from "vitest";
import {
  DEFAULT_INVOICE,
  InvoiceSchema,
  calcTotals,
  nextInvoiceNo,
  type InvoiceData,
} from "./invoice";

describe("calcTotals", () => {
  it("computes totals exactly: 2x100 + 1x50 with 18% tax = 295.00", () => {
    const totals = calcTotals({
      items: [
        { id: "a", desc: "A", qty: 2, rate: 100, taxPct: 18 },
        { id: "b", desc: "B", qty: 1, rate: 50, taxPct: 18 },
      ],
      discountFlat: 0,
    });
    expect(totals.subtotal).toBe(250);
    expect(totals.taxTotal).toBe(45);
    expect(totals.grandTotal).toBe(295);
  });

  it("applies flat discount before grand total", () => {
    const totals = calcTotals({
      items: [{ id: "a", desc: "A", qty: 2, rate: 100, taxPct: 18 }],
      discountFlat: 20,
    });
    // subtotal 200, discount 20, tax 36 => 216
    expect(totals.subtotal).toBe(200);
    expect(totals.discount).toBe(20);
    expect(totals.grandTotal).toBe(216);
  });

  it("caps discount at subtotal (never negative grand from discount)", () => {
    const totals = calcTotals({
      items: [{ id: "a", desc: "A", qty: 1, rate: 50, taxPct: 0 }],
      discountFlat: 1000,
    });
    expect(totals.discount).toBe(50);
    expect(totals.grandTotal).toBe(0);
  });

  it("rounds to 2dp (0.1 + 0.2 style float trap)", () => {
    const totals = calcTotals({
      items: [{ id: "a", desc: "A", qty: 3, rate: 0.1, taxPct: 10 }],
      discountFlat: 0,
    });
    // subtotal 0.30, tax 0.03, grand 0.33
    expect(totals.subtotal).toBe(0.3);
    expect(totals.taxTotal).toBe(0.03);
    expect(totals.grandTotal).toBe(0.33);
  });

  it("sums per-item taxPct (mixed rates)", () => {
    const totals = calcTotals({
      items: [
        { id: "a", desc: "A", qty: 1, rate: 100, taxPct: 18 },
        { id: "b", desc: "B", qty: 1, rate: 100, taxPct: 5 },
      ],
      discountFlat: 0,
    });
    expect(totals.taxTotal).toBe(23);
    expect(totals.grandTotal).toBe(223);
  });
});

describe("nextInvoiceNo", () => {
  it("increments INV-0001 to INV-0002", () => {
    expect(nextInvoiceNo("INV-0001")).toBe("INV-0002");
  });

  it("rolls over 0099 to 0100 preserving width", () => {
    expect(nextInvoiceNo("INV-0099")).toBe("INV-0100");
  });

  it("falls back to INV-0001 on garbage input", () => {
    expect(nextInvoiceNo("garbage")).toBe("INV-0001");
  });
});

describe("InvoiceSchema", () => {
  it("rejects empty items", () => {
    const data: InvoiceData = { ...DEFAULT_INVOICE, items: [] };
    const result = InvoiceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts the default invoice", () => {
    const result = InvoiceSchema.safeParse(DEFAULT_INVOICE);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = InvoiceSchema.safeParse({
      ...DEFAULT_INVOICE,
      fromEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});
