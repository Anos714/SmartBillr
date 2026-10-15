import Decimal from "decimal.js";
import { z } from "zod";

export type MetaLine = {
  label: string;
  value: string;
};

export type Adjustment = {
  id: string;
  label: string;
  value: number;
  type: "percentage" | "fixed";
};

export type InvoiceThemeMode = "light" | "dark";
export type InvoiceThemeFont = "geist" | "inter" | "serif";

export type InvoiceTheme = {
  baseColor: string;
  mode: InvoiceThemeMode;
  font: InvoiceThemeFont;
};

export type InvoiceItem = {
  id: string;
  /** Item title (migrated from legacy `desc` when missing). */
  name: string;
  /** Optional longer description shown under the name. */
  description: string;
  /** @deprecated legacy field — kept for backward-compat loading only. */
  desc?: string;
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
  /** Invoice number prefix, e.g. "INV-". Combined with serialNumber. */
  prefix: string;
  /** Serial portion, e.g. "0001". Combined with prefix. */
  serialNumber: string;
  issueDate: string;
  dueDate: string;
  currency: InvoiceCurrency;
  notes: string;
  terms: string;
  /** Payment terms line, e.g. "Net 14". */
  paymentTerms: string;
  gstin?: string;
  items: InvoiceItem[];
  discountFlat: number;
  adjustments: Adjustment[];
  companyMeta: MetaLine[];
  clientMeta: MetaLine[];
  paymentInfo: MetaLine[];
  signatureUrl?: string;
  theme: InvoiceTheme;
  templateId: string;
  accent?: string;
};

export type LineAmount = {
  id: string;
  /** qty * rate, Decimal-rounded to 2dp. Renderers must use this (no inline math). */
  amount: number;
};

export type AdjustmentAmount = {
  id: string;
  label: string;
  /** percentage-of-subtotal or fixed value, Decimal-rounded to 2dp. */
  amount: number;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxTotal: number;
  adjustmentsTotal: number;
  grandTotal: number;
  /** Per-line amounts (qty*rate rounded). */
  lines: LineAmount[];
  /** Per-adjustment amounts (percentage resolved against subtotal). */
  adjustmentsDetailed: AdjustmentAmount[];
};

/**
 * Single 2dp rounding source (Decimal ROUND_HALF_UP — correct for money,
 * e.g. 0.005 → 0.01). Accepts Decimals (exact) or plain numbers.
 */
export function round2(value: Decimal | number): number {
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (!d.isFinite()) return 0;
  return d.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

export function calcTotals(data: {
  items: InvoiceItem[];
  discountFlat: number;
  adjustments?: Adjustment[];
}): InvoiceTotals {
  let subtotal = new Decimal(0);
  let taxTotal = new Decimal(0);
  const lines: LineAmount[] = [];

  for (const item of data.items) {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    const line = qty.mul(rate);
    subtotal = subtotal.add(line);
    const taxPct = new Decimal(item.taxPct || 0);
    taxTotal = taxTotal.add(line.mul(taxPct).div(100));
    lines.push({ id: item.id, amount: round2(line) });
  }

  const discountRaw = new Decimal(data.discountFlat || 0);
  // Cap discount at subtotal, floor at 0
  const discount = Decimal.min(Decimal.max(discountRaw, 0), subtotal);

  const adjustmentsDetailed: AdjustmentAmount[] = [];
  let adjustmentsTotal = new Decimal(0);
  for (const adj of data.adjustments ?? []) {
    const v = new Decimal(adj.value || 0);
    const amount =
      adj.type === "percentage" ? subtotal.mul(v).div(100) : v;
    const rounded = round2(amount);
    adjustmentsDetailed.push({ id: adj.id, label: adj.label, amount: rounded });
    adjustmentsTotal = adjustmentsTotal.add(new Decimal(rounded));
  }

  const grandTotal = subtotal.sub(discount).add(taxTotal).add(adjustmentsTotal);

  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    taxTotal: round2(taxTotal),
    adjustmentsTotal: round2(adjustmentsTotal),
    grandTotal: round2(grandTotal),
    lines,
    adjustmentsDetailed,
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

/** Display number: prefix + serial, falling back to legacy invoiceNo. */
export function invoiceDisplayNo(
  data: Pick<InvoiceData, "prefix" | "serialNumber" | "invoiceNo">,
): string {
  if (data.prefix || data.serialNumber) {
    const combined = `${data.prefix ?? ""}${data.serialNumber ?? ""}`;
    if (combined.trim()) return combined;
  }
  return data.invoiceNo;
}

/** Split a legacy invoiceNo like "INV-0001" into prefix + serial. */
export function splitInvoiceNo(invoiceNo: string): {
  prefix: string;
  serialNumber: string;
} {
  const match = /^([A-Za-z]*-?)(\d+)$/.exec((invoiceNo ?? "").trim());
  if (!match) return { prefix: "INV-", serialNumber: "0001" };
  return { prefix: match[1] || "INV-", serialNumber: match[2] };
}

export const MetaLineSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const AdjustmentSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  value: z.number(),
  type: z.enum(["percentage", "fixed"]),
});

export const ThemeSchema = z.object({
  baseColor: z.string().min(1),
  mode: z.enum(["light", "dark"]),
  font: z.enum(["geist", "inter", "serif"]),
});

export const InvoiceItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  desc: z.string().optional(),
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
  prefix: z.string().min(1).default("INV-"),
  serialNumber: z.string().min(1).default("0001"),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.enum(["INR", "USD", "EUR"]),
  notes: z.string(),
  terms: z.string(),
  paymentTerms: z.string().optional().default(""),
  gstin: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
  discountFlat: z.number().min(0),
  adjustments: z.array(AdjustmentSchema).optional().default([]),
  companyMeta: z.array(MetaLineSchema).optional().default([]),
  clientMeta: z.array(MetaLineSchema).optional().default([]),
  paymentInfo: z.array(MetaLineSchema).optional().default([]),
  signatureUrl: z.string().optional(),
  theme: ThemeSchema.optional().default({
    baseColor: "#0C6B4F",
    mode: "light",
    font: "geist",
  }),
  templateId: z.string().min(1),
  accent: z.string().optional(),
});

export function newItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function newAdjustmentId(): string {
  return newItemId();
}

export const DEFAULT_ADJUSTMENTS: Adjustment[] = [];

export const DEFAULT_THEME: InvoiceTheme = {
  baseColor: "#0C6B4F",
  mode: "light",
  font: "geist",
};

/**
 * Fresh default invoice. Call this instead of referencing DEFAULT_INVOICE:
 * issueDate/dueDate are computed at call time, and every call returns
 * new arrays/objects (no shared-mutable state between store instances).
 */
export function defaultInvoice(): InvoiceData {
  return {
    fromName: "Acme Studio",
    fromEmail: "hello@acmestudio.com",
    fromAddress: "123 Main Street, Bengaluru, KA 560001",
    logoUrl: "",
    billToName: "Client Co",
    billToEmail: "client@example.com",
    billToAddress: "456 Client Road, Mumbai, MH 400001",
    invoiceNo: "INV-0001",
    prefix: "INV-",
    serialNumber: "0001",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    currency: "INR",
    notes: "Thank you for your business!",
    terms: "Payment due within 14 days.",
    paymentTerms: "Net 14",
    gstin: "",
    items: [
      {
        id: "item-1",
        name: "Design work",
        description: "",
        qty: 2,
        rate: 100,
        taxPct: 18,
      },
      {
        id: "item-2",
        name: "Development",
        description: "",
        qty: 1,
        rate: 50,
        taxPct: 18,
      },
    ],
    discountFlat: 0,
    adjustments: [],
    companyMeta: [],
    clientMeta: [],
    paymentInfo: [],
    signatureUrl: "",
    theme: { ...DEFAULT_THEME },
    templateId: "minimal-white",
    accent: "#09090b",
  };
}

/**
 * @deprecated Import-time snapshot for backward-compat only (dates are
 * frozen at module load). New code must call `defaultInvoice()`.
 */
export const DEFAULT_INVOICE: InvoiceData = defaultInvoice();

/** Migrate a single raw (possibly legacy) item to the current shape. */
export function migrateItem(raw: Record<string, unknown>): InvoiceItem {
  const r = raw as Partial<InvoiceItem> & { desc?: unknown; name?: unknown };
  const name =
    typeof r.name === "string" && r.name.trim()
      ? r.name
      : typeof r.desc === "string" && r.desc.trim()
        ? r.desc
        : "Untitled item";
  const description =
    typeof r.description === "string"
      ? r.description
      : typeof r.desc === "string" &&
          typeof r.name === "string" &&
          r.name.trim()
        ? r.desc
        : "";
  return {
    id: typeof r.id === "string" && r.id ? r.id : newItemId(),
    name,
    description,
    qty: typeof r.qty === "number" ? r.qty : Number(r.qty) || 0,
    rate: typeof r.rate === "number" ? r.rate : Number(r.rate) || 0,
    taxPct: typeof r.taxPct === "number" ? r.taxPct : Number(r.taxPct) || 0,
    ...(typeof r.hsn === "string" && r.hsn ? { hsn: r.hsn } : {}),
  };
}

/** Migrate raw persisted data (old shapes) to current InvoiceData. */
export function migrateInvoice(raw: unknown): InvoiceData {
  const r = (raw ?? {}) as Partial<InvoiceData> & {
    items?: unknown;
    theme?: unknown;
  };
  // Fresh defaults per call (no shared-mutable fallback, no stale dates).
  const fallback = defaultInvoice();
  const itemsRaw = Array.isArray(r.items) ? r.items : fallback.items;
  const items = itemsRaw.map((it) =>
    migrateItem((it ?? {}) as Record<string, unknown>),
  );

  let prefix =
    typeof r.prefix === "string" && r.prefix ? r.prefix : undefined;
  let serialNumber =
    typeof r.serialNumber === "string" && r.serialNumber
      ? r.serialNumber
      : undefined;
  let invoiceNo =
    typeof r.invoiceNo === "string" && r.invoiceNo
      ? r.invoiceNo
      : fallback.invoiceNo;
  if (prefix === undefined || serialNumber === undefined) {
    const split = splitInvoiceNo(invoiceNo);
    prefix ??= split.prefix;
    serialNumber ??= split.serialNumber;
  }
  invoiceNo = `${prefix}${serialNumber}`;

  const themeRaw = (r.theme ?? {}) as Partial<InvoiceTheme>;
  const theme: InvoiceTheme = {
    baseColor:
      typeof themeRaw.baseColor === "string" && themeRaw.baseColor
        ? themeRaw.baseColor
        : DEFAULT_THEME.baseColor,
    mode: themeRaw.mode === "dark" ? "dark" : "light",
    font:
      themeRaw.font === "inter" ||
      themeRaw.font === "serif" ||
      themeRaw.font === "geist"
        ? themeRaw.font
        : "geist",
  };

  return {
    ...fallback,
    ...r,
    invoiceNo,
    prefix: prefix ?? fallback.prefix,
    serialNumber: serialNumber ?? fallback.serialNumber,
    paymentTerms:
      typeof r.paymentTerms === "string"
        ? r.paymentTerms
        : (r as { terms?: unknown }).terms === undefined
          ? fallback.paymentTerms
          : fallback.paymentTerms,
    items,
    adjustments: Array.isArray(r.adjustments)
      ? (r.adjustments as Adjustment[])
      : [],
    companyMeta: Array.isArray(r.companyMeta)
      ? (r.companyMeta as MetaLine[])
      : [],
    clientMeta: Array.isArray(r.clientMeta)
      ? (r.clientMeta as MetaLine[])
      : [],
    paymentInfo: Array.isArray(r.paymentInfo)
      ? (r.paymentInfo as MetaLine[])
      : [],
    signatureUrl:
      typeof r.signatureUrl === "string" ? r.signatureUrl : "",
    theme,
  };
}
