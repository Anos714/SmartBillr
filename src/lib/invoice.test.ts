import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADJUSTMENTS,
  DEFAULT_INVOICE,
  defaultInvoice,
  InvoiceSchema,
  calcTotals,
  invoiceDisplayNo,
  migrateInvoice,
  nextInvoiceNo,
  type InvoiceData,
} from "./invoice";

const item = (over: Record<string, unknown> = {}) => ({
  id: "a",
  name: "A",
  description: "",
  qty: 0,
  rate: 0,
  taxPct: 0,
  ...over,
});

describe("calcTotals", () => {
  it("computes totals exactly: 2x100 + 1x50 with 18% tax = 295.00", () => {
    const totals = calcTotals({
      items: [
        { ...item({ id: "a", qty: 2, rate: 100, taxPct: 18 }) },
        { ...item({ id: "b", name: "B", qty: 1, rate: 50, taxPct: 18 }) },
      ],
      discountFlat: 0,
    });
    expect(totals.subtotal).toBe(250);
    expect(totals.taxTotal).toBe(45);
    expect(totals.grandTotal).toBe(295);
  });

  it("applies flat discount before grand total", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 2, rate: 100, taxPct: 18 }) }],
      discountFlat: 20,
    });
    // subtotal 200, discount 20, tax 36 => 216
    expect(totals.subtotal).toBe(200);
    expect(totals.discount).toBe(20);
    expect(totals.grandTotal).toBe(216);
  });

  it("caps discount at subtotal (never negative grand from discount)", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 1, rate: 50, taxPct: 0 }) }],
      discountFlat: 1000,
    });
    expect(totals.discount).toBe(50);
    expect(totals.grandTotal).toBe(0);
  });

  it("rounds to 2dp (0.1 + 0.2 style float trap)", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 3, rate: 0.1, taxPct: 10 }) }],
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
        { ...item({ qty: 1, rate: 100, taxPct: 18 }) },
        { ...item({ id: "b", name: "B", qty: 1, rate: 100, taxPct: 5 }) },
      ],
      discountFlat: 0,
    });
    expect(totals.taxTotal).toBe(23);
    expect(totals.grandTotal).toBe(223);
  });

  it("applies percentage adjustments on subtotal", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 1, rate: 200, taxPct: 0 }) }],
      discountFlat: 0,
      adjustments: [{ id: "a1", label: "GST 18%", value: 18, type: "percentage" }],
    });
    // subtotal 200 + 36 adjustment = 236
    expect(totals.adjustmentsTotal).toBe(36);
    expect(totals.grandTotal).toBe(236);
  });

  it("applies fixed adjustments by sign (negative = discount, positive = charge)", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 1, rate: 200, taxPct: 10 }) }],
      discountFlat: 20,
      adjustments: [
        { id: "a1", label: "Extra discount", value: -10, type: "fixed" },
        { id: "a2", label: "Shipping", value: 25, type: "fixed" },
      ],
    });
    // subtotal 200 - 20 discount + 20 tax + (-10 + 25) = 215
    expect(totals.adjustmentsTotal).toBe(15);
    expect(totals.grandTotal).toBe(215);
  });

  it("mixes percentage + fixed adjustments", () => {
    const totals = calcTotals({
      items: [{ ...item({ qty: 2, rate: 100, taxPct: 18 }) }],
      discountFlat: 20,
      adjustments: [
        { id: "a1", label: "Service 5%", value: 5, type: "percentage" },
        { id: "a2", label: "Shipping", value: 10, type: "fixed" },
      ],
    });
    // subtotal 200, discount 20, tax 36, adjustments 10 + 10 = 20 → 236
    expect(totals.adjustmentsTotal).toBe(20);
    expect(totals.grandTotal).toBe(236);
  });

  it("returns per-line amounts rounded with Decimal (3 x 19.99)", () => {
    const totals = calcTotals({
      items: [{ ...item({ id: "l1", qty: 3, rate: 19.99, taxPct: 0 }) }],
      discountFlat: 0,
    });
    // 3 * 19.99 = 59.97 (float would give 59.969999…)
    expect(totals.lines).toEqual([{ id: "l1", amount: 59.97 }]);
    expect(totals.subtotal).toBe(59.97);
  });

  it("returns per-adjustment detail resolved against subtotal", () => {
    const totals = calcTotals({
      items: [{ ...item({ id: "l1", qty: 2, rate: 100, taxPct: 0 }) }],
      discountFlat: 0,
      adjustments: [
        { id: "a1", label: "GST 18%", value: 18, type: "percentage" },
        { id: "a2", label: "Shipping", value: 25, type: "fixed" },
      ],
    });
    expect(totals.adjustmentsDetailed).toEqual([
      { id: "a1", label: "GST 18%", amount: 36 },
      { id: "a2", label: "Shipping", amount: 25 },
    ]);
    // detail sums to the total (no hidden rounding drift)
    expect(
      totals.adjustmentsDetailed.reduce((a, d) => a + d.amount, 0),
    ).toBe(totals.adjustmentsTotal);
  });
});

describe("defaultInvoice factory", () => {
  it("returns fresh objects per call (no shared-mutable state)", () => {
    const a = defaultInvoice();
    const b = defaultInvoice();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.items).not.toBe(b.items);
    expect(a.theme).not.toBe(b.theme);
    a.items.push({
      id: "x",
      name: "X",
      description: "",
      qty: 1,
      rate: 1,
      taxPct: 0,
    });
    expect(b.items).toHaveLength(2);
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

describe("invoiceDisplayNo", () => {
  it("combines prefix + serial", () => {
    expect(
      invoiceDisplayNo({ prefix: "INV-", serialNumber: "0042", invoiceNo: "INV-0001" }),
    ).toBe("INV-0042");
  });
});

describe("migration (backward-compat desc -> name)", () => {
  it("migrates old desc-only items to name on load", () => {
    const migrated = migrateInvoice({
      ...DEFAULT_INVOICE,
      items: [{ id: "old-1", desc: "Legacy design work", qty: 1, rate: 100, taxPct: 18 }],
    });
    expect(migrated.items[0].name).toBe("Legacy design work");
    expect(migrated.prefix).toBe("INV-");
    expect(migrated.serialNumber).toBe("0001");
  });

  it("splits legacy invoiceNo into prefix + serial", () => {
    const migrated = migrateInvoice({
      invoiceNo: "BILL-0042",
      items: [{ id: "x", desc: "Y", qty: 1, rate: 1, taxPct: 0 }],
    });
    expect(migrated.prefix).toBe("BILL-");
    expect(migrated.serialNumber).toBe("0042");
    expect(migrated.invoiceNo).toBe("BILL-0042");
  });

  it("defaults adjustments/theme/meta to empty", () => {
    const migrated = migrateInvoice({
      items: [{ id: "x", desc: "Y", qty: 1, rate: 1, taxPct: 0 }],
    });
    expect(migrated.adjustments).toEqual([]);
    expect(migrated.theme.baseColor).toBe("#0C6B4F");
    expect(DEFAULT_ADJUSTMENTS).toEqual([]);
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
