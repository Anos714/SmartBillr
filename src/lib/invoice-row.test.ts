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

  it("defaults status to draft and stores fromJson/template/currency", () => {
    const row = toRow("user-9", DEFAULT_INVOICE);
    expect(row.status).toBe("draft");
    expect(row.currency).toBe(DEFAULT_INVOICE.currency);
    expect(row.templateId).toBe(DEFAULT_INVOICE.templateId);
    expect(row.fromJson).toEqual({
      fromName: DEFAULT_INVOICE.fromName,
      fromEmail: DEFAULT_INVOICE.fromEmail,
      fromAddress: DEFAULT_INVOICE.fromAddress,
      logoUrl: DEFAULT_INVOICE.logoUrl ?? "",
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

  it("normalizes unknown/null status to draft", () => {
    expect(normalizeStatus("paid")).toBe("paid");
    expect(normalizeStatus("bogus")).toBe("draft");
    expect(fromRow(sampleRow({ status: null })).status).toBe("draft");
    expect(fromRow(sampleRow({ status: "weird" })).status).toBe("draft");
  });
});
