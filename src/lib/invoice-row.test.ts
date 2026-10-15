import { describe, expect, it } from "vitest";

import type { InvoiceRow } from "./invoice-row";
import { fromRow, normalizeStatus, toRow } from "./invoice-row";
import { calcTotals, DEFAULT_INVOICE } from "./invoice";

function sampleRow(over: Partial<InvoiceRow> = {}): InvoiceRow {
  const insert = toRow("user-1", DEFAULT_INVOICE, "draft");
  return {
    id: "row-1",
    userId: "user-1",
    invoiceNo: (insert.invoiceNo as string | null) ?? "INV-0001",
    clientName: (insert.clientName as string | null) ?? null,
    clientEmail: (insert.clientEmail as string | null) ?? null,
    fromJson: (insert.fromJson as InvoiceRow["fromJson"]) ?? null,
    items: (insert.items as InvoiceRow["items"]) ?? null,
    subtotal: (insert.subtotal as string | null) ?? null,
    discount: (insert.discount as string | null) ?? null,
    tax: (insert.tax as string | null) ?? null,
    total: (insert.total as string | null) ?? null,
    currency: (insert.currency as string | null) ?? null,
    status: (insert.status as string | null) ?? null,
    templateId: (insert.templateId as string | null) ?? null,
    logoUrl: (insert.logoUrl as string | null) ?? null,
    signatureUrl: (insert.signatureUrl as string | null) ?? null,
    paidAt: null,
    createdAt: new Date("2026-01-02T03:04:05.000Z"),
    updatedAt: new Date("2026-01-03T03:04:05.000Z"),
    ...over,
  };
}

describe("invoice-row mapper", () => {
  it("maps InvoiceData to a db row with numeric totals as strings", () => {
    const row = toRow("user-1", DEFAULT_INVOICE, "draft");
    // subtotal 250 (2x100 + 1x50), tax 45 (18%), grand 295
    expect(row.userId).toBe("user-1");
    expect(row.invoiceNo).toBe("INV-0001");
    expect(row.clientName).toBe(DEFAULT_INVOICE.billToName);
    expect(row.clientEmail).toBe(DEFAULT_INVOICE.billToEmail);
    expect(row.subtotal).toBe("250");
    expect(row.discount).toBe("0");
    expect(row.tax).toBe("45");
    expect(row.total).toBe("295");
    expect(typeof row.subtotal).toBe("string");
    expect(typeof row.total).toBe("string");
  });

  it("defaults status to draft and stores full invoice JSON + query columns", () => {
    const row = toRow("user-9", DEFAULT_INVOICE);
    expect(row.status).toBe("draft");
    expect(row.currency).toBe(DEFAULT_INVOICE.currency);
    expect(row.templateId).toBe(DEFAULT_INVOICE.templateId);
    // fromJson now holds the COMPLETE invoice (no dropped fields)
    expect(row.fromJson).toMatchObject({
      fromName: DEFAULT_INVOICE.fromName,
      billToAddress: DEFAULT_INVOICE.billToAddress,
      notes: DEFAULT_INVOICE.notes,
      terms: DEFAULT_INVOICE.terms,
      paymentTerms: DEFAULT_INVOICE.paymentTerms,
    });
    expect(row.items).toEqual(DEFAULT_INVOICE.items);
  });

  it("roundtrips row -> SavedInvoice preserving core fields", () => {
    const row = sampleRow({ status: "paid" });
    const saved = fromRow(row);
    const expectedTotal = calcTotals({
      items: DEFAULT_INVOICE.items,
      discountFlat: DEFAULT_INVOICE.discountFlat,
      adjustments: DEFAULT_INVOICE.adjustments ?? [],
    }).grandTotal;
    expect(saved.id).toBe("row-1");
    expect(saved.savedAt).toBe("2026-01-02T03:04:05.000Z");
    expect(saved.status).toBe("paid");
    expect(saved.total).toBe(expectedTotal);
    expect(saved.invoice.billToName).toBe(DEFAULT_INVOICE.billToName);
    expect(saved.invoice.billToEmail).toBe(DEFAULT_INVOICE.billToEmail);
    expect(saved.invoice.items).toHaveLength(DEFAULT_INVOICE.items.length);
    expect(saved.invoice.currency).toBe(DEFAULT_INVOICE.currency);
    expect(saved.invoice.templateId).toBe(DEFAULT_INVOICE.templateId);
  });

  it("roundtrips full invoice JSON: notes/meta/adjustments/hsn survive", () => {
    const invoice = {
      ...DEFAULT_INVOICE,
      billToAddress: "9 Client Lane, Pune",
      notes: "Handle with care",
      terms: "Net 30, no returns",
      paymentTerms: "Net 30",
      gstin: "27ABCDE1234F1Z5",
      items: [
        {
          id: "i-hsn",
          name: "Widget",
          description: "",
          qty: 3,
          rate: 19.99,
          taxPct: 18,
          hsn: "8471",
        },
      ],
      adjustments: [
        { id: "a1", label: "GST 18%", value: 18, type: "percentage" as const },
      ],
      companyMeta: [{ label: "PAN", value: "ABCDE1234F" }],
      clientMeta: [{ label: "Dept", value: "Procurement" }],
      paymentInfo: [{ label: "UPI", value: "pay@upi" }],
    };
    const row = sampleRow({
      ...toRow("user-1", invoice, "draft"),
      id: "row-full",
    } as Partial<InvoiceRow>);
    const saved = fromRow(row);
    expect(saved.invoice.billToAddress).toBe("9 Client Lane, Pune");
    expect(saved.invoice.notes).toBe("Handle with care");
    expect(saved.invoice.terms).toBe("Net 30, no returns");
    expect(saved.invoice.paymentTerms).toBe("Net 30");
    expect(saved.invoice.gstin).toBe("27ABCDE1234F1Z5");
    expect(saved.invoice.items[0].hsn).toBe("8471");
    expect(saved.invoice.adjustments).toHaveLength(1);
    expect(saved.invoice.companyMeta).toEqual([
      { label: "PAN", value: "ABCDE1234F" },
    ]);
    expect(saved.invoice.clientMeta).toEqual([
      { label: "Dept", value: "Procurement" },
    ]);
    expect(saved.invoice.paymentInfo).toEqual([{ label: "UPI", value: "pay@upi" }]);
    // line total uses Decimal rounding, not float math
    expect(
      calcTotals({
        items: saved.invoice.items,
        discountFlat: saved.invoice.discountFlat,
        adjustments: saved.invoice.adjustments,
      }).lines[0].amount,
    ).toBe(59.97);
  });

  it("still loads legacy rows (fragment fromJson shape)", () => {
    const legacy = sampleRow({
      fromJson: {
        fromName: "Old Co",
        fromEmail: "old@co.com",
        fromAddress: "1 Old St",
        logoUrl: "",
      } as InvoiceRow["fromJson"],
      clientName: "Legacy Client",
      clientEmail: "legacy@client.com",
    });
    const saved = fromRow(legacy);
    expect(saved.invoice.fromName).toBe("Old Co");
    expect(saved.invoice.billToName).toBe("Legacy Client");
    expect(saved.invoice.billToEmail).toBe("legacy@client.com");
    expect(saved.invoice.items).toHaveLength(DEFAULT_INVOICE.items.length);
    expect(saved.status).toBe("draft");
  });

  it("normalizes unknown/null status to draft", () => {
    expect(normalizeStatus("paid")).toBe("paid");
    expect(normalizeStatus("bogus")).toBe("draft");
    expect(fromRow(sampleRow({ status: null })).status).toBe("draft");
    expect(fromRow(sampleRow({ status: "weird" })).status).toBe("draft");
  });

  it("sets paidAt on toRow when paid, clears otherwise", () => {
    const paid = toRow("user-1", DEFAULT_INVOICE, "paid");
    expect(paid.paidAt).toBeInstanceOf(Date);
    expect(toRow("user-1", DEFAULT_INVOICE, "draft").paidAt).toBeNull();
    expect(toRow("user-1", DEFAULT_INVOICE, "pending").paidAt).toBeNull();
  });

  it("fromRow prefers the paidAt column, falls back to updatedAt when paid", () => {
    const withPaidAt = sampleRow({
      status: "paid",
      paidAt: new Date("2026-02-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    });
    expect(fromRow(withPaidAt).paidAt).toBe("2026-02-01T00:00:00.000Z");
    const legacyPaid = sampleRow({ status: "paid", paidAt: null });
    expect(fromRow(legacyPaid).paidAt).toBe("2026-01-03T03:04:05.000Z");
    expect(fromRow(sampleRow({ status: "draft" })).paidAt).toBeUndefined();
  });
});
