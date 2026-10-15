import Decimal from "decimal.js";
import { z } from "zod";

export type InvoiceItem = {
  id: string;
  desc: string;
  qty: number;
  rate: number;
  taxPct: number;
  hsn?: string;
};

export type InvoiceCurrency = "INR" | "USD" | "EUR";

export type InvoiceData = {
  fromName: string;
  fromEmail: string;
  fromAddress: string;
  logoUrl?: string;
  billToName: string;
  billToEmail: string;
  billToAddress: string;
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  currency: InvoiceCurrency;
  notes: string;
  terms: string;
  gstin?: string;
  items: InvoiceItem[];
  discountFlat: number;
  templateId: string;
  accent?: string;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxTotal: number;
  grandTotal: number;
};

const round2 = (d: Decimal): number =>
  d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

export function calcTotals(data: Pick<InvoiceData, "items" | "discountFlat">): InvoiceTotals {
  let subtotal = new Decimal(0);
  let taxTotal = new Decimal(0);

  for (const item of data.items) {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    const line = qty.mul(rate);
    subtotal = subtotal.add(line);
    const taxPct = new Decimal(item.taxPct || 0);
    taxTotal = taxTotal.add(line.mul(taxPct).div(100));
  }

  const discountRaw = new Decimal(data.discountFlat || 0);
  // Cap discount at subtotal, floor at 0
  const discount = Decimal.min(Decimal.max(discountRaw, 0), subtotal);

  const grandTotal = subtotal.sub(discount).add(taxTotal);

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    taxTotal: round2(taxTotal),
    grandTotal: round2(grandTotal),
  };
}

export function nextInvoiceNo(last: string): string {
  const match = /^([A-Za-z]*-?)(\d+)$/.exec(last.trim());
  if (!match) return "INV-0001";
  const prefix = match[1] || "INV-";
  const digits = match[2];
  const next = parseInt(digits, 10) + 1;
  const width = Math.max(4, digits.length);
  return `${prefix}${String(next).padStart(width, "0")}`;
}

export const InvoiceItemSchema = z.object({
  id: z.string().min(1),
  desc: z.string().min(1, "Description is required"),
  qty: z.number().min(0),
  rate: z.number().min(0),
  taxPct: z.number().min(0).max(100),
  hsn: z.string().optional(),
});

export const InvoiceSchema = z.object({
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Valid from email required"),
  fromAddress: z.string().min(1, "From address is required"),
  logoUrl: z.string().optional(),
  billToName: z.string().min(1, "Bill-to name is required"),
  billToEmail: z.string().email("Valid bill-to email required"),
  billToAddress: z.string().min(1, "Bill-to address is required"),
  invoiceNo: z.string().min(1),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.enum(["INR", "USD", "EUR"]),
  notes: z.string(),
  terms: z.string(),
  gstin: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
  discountFlat: z.number().min(0),
  templateId: z.string().min(1),
  accent: z.string().optional(),
});

export function newItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const DEFAULT_INVOICE: InvoiceData = {
  fromName: "Acme Studio",
  fromEmail: "hello@acmestudio.com",
  fromAddress: "123 Main Street, Bengaluru, KA 560001",
  logoUrl: "",
  billToName: "Client Co",
  billToEmail: "client@example.com",
  billToAddress: "456 Client Road, Mumbai, MH 400001",
  invoiceNo: "INV-0001",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  currency: "INR",
  notes: "Thank you for your business!",
  terms: "Payment due within 14 days.",
  gstin: "",
  items: [
    { id: "item-1", desc: "Design work", qty: 2, rate: 100, taxPct: 18 },
    { id: "item-2", desc: "Development", qty: 1, rate: 50, taxPct: 18 },
  ],
  discountFlat: 0,
  templateId: "minimal-white",
  accent: "#09090b",
};
