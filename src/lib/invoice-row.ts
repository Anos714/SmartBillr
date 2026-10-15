import {
  calcTotals,
  migrateInvoice,
  splitInvoiceNo,
  type InvoiceData,
} from "@/lib/invoice";
import type { InvoiceStatus, SavedInvoice } from "@/lib/library";
import { DEFAULT_INVOICE } from "@/lib/invoice";
import type { invoices } from "@/db/schema";

export type InvoiceRow = typeof invoices.$inferSelect;
export type InvoiceInsert = typeof invoices.$inferInsert;

const STATUSES: InvoiceStatus[] = ["draft", "paid", "pending", "overdue"];

export function normalizeStatus(value: unknown): InvoiceStatus {
  return STATUSES.includes(value as InvoiceStatus)
    ? (value as InvoiceStatus)
    : "draft";
}

/** Pure mapper: InvoiceData -> invoices insert row (totals computed server-side). */
export function toRow(
  userId: string,
  invoice: InvoiceData,
  status: InvoiceStatus = "draft",
): InvoiceInsert {
  const totals = calcTotals({
    items: invoice.items,
    discountFlat: invoice.discountFlat,
    adjustments: invoice.adjustments ?? [],
  });
  const combined = `${invoice.prefix ?? ""}${invoice.serialNumber ?? ""}`.trim();
  const invoiceNo = combined || invoice.invoiceNo;
  return {
    userId,
    invoiceNo,
    clientName: invoice.billToName,
    clientEmail: invoice.billToEmail,
    fromJson: {
      fromName: invoice.fromName,
      fromEmail: invoice.fromEmail,
      fromAddress: invoice.fromAddress,
      logoUrl: invoice.logoUrl ?? "",
    },
    items: invoice.items,
    subtotal: String(totals.subtotal),
    discount: String(totals.discount),
    tax: String(totals.taxTotal),
    total: String(totals.grandTotal),
    currency: invoice.currency,
    status,
    templateId: invoice.templateId,
    logoUrl: invoice.logoUrl || null,
    signatureUrl: invoice.signatureUrl || null,
  };
}

/** Pure mapper: invoices row -> SavedInvoice (reconstructed InvoiceData). */
export function fromRow(row: InvoiceRow): SavedInvoice {
  const from =
    (row.fromJson as Partial<
      Pick<InvoiceData, "fromName" | "fromEmail" | "fromAddress" | "logoUrl">
    > | null) ?? {};
  const itemsRaw = Array.isArray(row.items) ? row.items : [];
  const invoiceNo =
    typeof row.invoiceNo === "string" && row.invoiceNo
      ? row.invoiceNo
      : DEFAULT_INVOICE.invoiceNo;
  const split = splitInvoiceNo(invoiceNo);
  const status = normalizeStatus(row.status);
  const currency: InvoiceData["currency"] =
    row.currency === "USD" || row.currency === "EUR" || row.currency === "INR"
      ? row.currency
      : "INR";
  const discountFlat = Number(row.discount);
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : typeof row.createdAt === "string"
        ? row.createdAt
        : new Date().toISOString();
  // No paidAt column in the DB (by design — no migration). Derive it:
  // when status is paid, Paid At = updatedAt (set on every PATCH);
  // otherwise undefined. Clients fall back to savedAt when missing.
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : typeof row.updatedAt === "string"
        ? row.updatedAt
        : undefined;

  const invoice = migrateInvoice({
    fromName: typeof from.fromName === "string" ? from.fromName : "",
    fromEmail: typeof from.fromEmail === "string" ? from.fromEmail : "",
    fromAddress: typeof from.fromAddress === "string" ? from.fromAddress : "",
    logoUrl:
      typeof row.logoUrl === "string"
        ? row.logoUrl
        : typeof from.logoUrl === "string"
          ? from.logoUrl
          : "",
    billToName: typeof row.clientName === "string" ? row.clientName : "",
    billToEmail: typeof row.clientEmail === "string" ? row.clientEmail : "",
    invoiceNo,
    prefix: split.prefix,
    serialNumber: split.serialNumber,
    currency,
    items: itemsRaw as Record<string, unknown>[],
    discountFlat: Number.isFinite(discountFlat) ? discountFlat : 0,
    signatureUrl: typeof row.signatureUrl === "string" ? row.signatureUrl : "",
    templateId:
      typeof row.templateId === "string" && row.templateId
        ? row.templateId
        : DEFAULT_INVOICE.templateId,
  });

  const totalNum = Number(row.total);
  const total = Number.isFinite(totalNum)
    ? totalNum
    : calcTotals({
        items: invoice.items,
        discountFlat: invoice.discountFlat,
        adjustments: invoice.adjustments ?? [],
      }).grandTotal;

  return {
    id: row.id,
    savedAt: createdAt,
    invoice,
    status,
    total,
    ...(status === "paid" && updatedAt ? { paidAt: updatedAt } : {}),
  };
}
