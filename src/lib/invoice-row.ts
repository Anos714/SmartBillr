import {
  calcTotals,
  defaultInvoice,
  migrateInvoice,
  splitInvoiceNo,
  type InvoiceData,
} from "@/lib/invoice";
import type { InvoiceStatus, SavedInvoice } from "@/lib/library";
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
    // Store the COMPLETE invoice JSON so no field is lost on round-trip
    // (billToAddress, notes, terms, paymentTerms, gstin, adjustments,
    // companyMeta/clientMeta/paymentInfo, hsn, ...). Legacy columns stay
    // for query/display compatibility.
    fromJson: { ...invoice },
    items: invoice.items,
    subtotal: String(totals.subtotal),
    discount: String(totals.discount),
    tax: String(totals.taxTotal),
    total: String(totals.grandTotal),
    currency: invoice.currency,
    status,
    paidAt: status === "paid" ? new Date() : null,
    templateId: invoice.templateId,
    logoUrl: invoice.logoUrl || null,
    signatureUrl: invoice.signatureUrl || null,
  };
}

/** True when fromJson holds a complete InvoiceData (new shape), as opposed
 * to the legacy {fromName, fromEmail, fromAddress, logoUrl} fragment. */
function isCompleteInvoiceJson(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.billToName === "string" ||
    typeof r.billToAddress === "string" ||
    Array.isArray(r.items)
  );
}

/** Pure mapper: invoices row -> SavedInvoice (reconstructed InvoiceData). */
export function fromRow(row: InvoiceRow): SavedInvoice {
  const fallback = defaultInvoice();
  const rawJson: unknown = row.fromJson;
  const legacy =
    rawJson && typeof rawJson === "object"
      ? (rawJson as Record<string, unknown>)
      : {};
  // Prefer the complete stored invoice JSON; fall back to legacy columns
  // for rows written before the full-JSON change.
  const base = isCompleteInvoiceJson(rawJson)
    ? migrateInvoice(rawJson)
    : migrateInvoice({
        fromName: typeof legacy.fromName === "string" ? legacy.fromName : "",
        fromEmail:
          typeof legacy.fromEmail === "string" ? legacy.fromEmail : "",
        fromAddress:
          typeof legacy.fromAddress === "string" ? legacy.fromAddress : "",
        logoUrl:
          typeof row.logoUrl === "string"
            ? row.logoUrl
            : typeof legacy.logoUrl === "string"
              ? legacy.logoUrl
              : "",
        billToName: typeof row.clientName === "string" ? row.clientName : "",
        billToEmail: typeof row.clientEmail === "string" ? row.clientEmail : "",
        invoiceNo:
          typeof row.invoiceNo === "string" && row.invoiceNo
            ? row.invoiceNo
            : fallback.invoiceNo,
        currency:
          row.currency === "USD" ||
          row.currency === "EUR" ||
          row.currency === "INR"
            ? row.currency
            : fallback.currency,
        items: Array.isArray(row.items) ? row.items : [],
        discountFlat: Number.isFinite(Number(row.discount))
          ? Number(row.discount)
          : fallback.discountFlat,
        signatureUrl: row.signatureUrl,
        templateId:
          typeof row.templateId === "string" && row.templateId
            ? row.templateId
            : fallback.templateId,
      });
  const from = base;
  const invoiceNo =
    typeof row.invoiceNo === "string" && row.invoiceNo
      ? row.invoiceNo
      : from.invoiceNo;
  const split = splitInvoiceNo(invoiceNo);
  const status = normalizeStatus(row.status);
  const currency: InvoiceData["currency"] =
    row.currency === "USD" || row.currency === "EUR" || row.currency === "INR"
      ? row.currency
      : from.currency;
  const discountFlat = Number(row.discount);
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : typeof row.createdAt === "string"
        ? row.createdAt
        : new Date().toISOString();
  // paidAt: prefer the real column; fall back to updatedAt when paid
  // (rows written before the paid_at migration); otherwise undefined.
  // Clients fall back to savedAt when missing.
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : typeof row.updatedAt === "string"
        ? row.updatedAt
        : undefined;
  const paidAt =
    row.paidAt instanceof Date
      ? row.paidAt.toISOString()
      : typeof row.paidAt === "string"
        ? row.paidAt
        : undefined;

  // Row-level query/display columns stay authoritative over the stored
  // JSON (they may be patched independently, e.g. status flows).
  const invoice = migrateInvoice({
    ...from,
    fromName: typeof from.fromName === "string" ? from.fromName : "",
    fromEmail: typeof from.fromEmail === "string" ? from.fromEmail : "",
    fromAddress: typeof from.fromAddress === "string" ? from.fromAddress : "",
    logoUrl:
      typeof row.logoUrl === "string"
        ? row.logoUrl
        : typeof from.logoUrl === "string"
          ? from.logoUrl
          : "",
    billToName:
      typeof row.clientName === "string" && row.clientName
        ? row.clientName
        : from.billToName,
    billToEmail:
      typeof row.clientEmail === "string" && row.clientEmail
        ? row.clientEmail
        : from.billToEmail,
    invoiceNo,
    prefix: split.prefix,
    serialNumber: split.serialNumber,
    currency,
    items:
      Array.isArray(row.items) && row.items.length > 0
        ? (row.items as Record<string, unknown>[])
        : from.items,
    discountFlat: Number.isFinite(discountFlat) ? discountFlat : from.discountFlat,
    signatureUrl:
      typeof row.signatureUrl === "string" ? row.signatureUrl : (from.signatureUrl ?? ""),
    templateId:
      typeof row.templateId === "string" && row.templateId
        ? row.templateId
        : from.templateId,
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
    ...(status === "paid" && (paidAt ?? updatedAt)
      ? { paidAt: (paidAt ?? updatedAt) as string }
      : {}),
  };
}
