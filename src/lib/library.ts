import { calcTotals, migrateInvoice, type InvoiceData } from "./invoice";

export const LIBRARY_KEY = "smartbillr_invoices";

export type InvoiceStatus = "draft" | "paid" | "pending" | "overdue";

export type SavedInvoice = {
  id: string;
  savedAt: string;
  invoice: InvoiceData;
  status: InvoiceStatus;
  total: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `inv-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function computeTotal(invoice: InvoiceData): number {
  return calcTotals({
    items: invoice.items,
    discountFlat: invoice.discountFlat,
    adjustments: invoice.adjustments ?? [],
  }).grandTotal;
}

function normalize(raw: unknown): SavedInvoice[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedInvoice[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== "string" || !e.id) continue;
    let invoice: InvoiceData;
    try {
      invoice = migrateInvoice(e.invoice);
    } catch {
      continue;
    }
    const status: InvoiceStatus =
      e.status === "paid" ||
      e.status === "pending" ||
      e.status === "overdue" ||
      e.status === "draft"
        ? e.status
        : "draft";
    const total =
      typeof e.total === "number" && Number.isFinite(e.total)
        ? e.total
        : computeTotal(invoice);
    out.push({
      id: e.id,
      savedAt:
        typeof e.savedAt === "string" && e.savedAt
          ? e.savedAt
          : new Date().toISOString(),
      invoice,
      status,
      total,
    });
  }
  return out;
}

function readRaw(): SavedInvoice[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return [];
    return normalize(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeRaw(list: SavedInvoice[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(list));
  } catch {
    // storage full / private mode — ignore
  }
}

export function listInvoices(): SavedInvoice[] {
  return readRaw();
}

export function getInvoice(id: string): SavedInvoice | null {
  return readRaw().find((e) => e.id === id) ?? null;
}

export function saveInvoice(
  invoice: InvoiceData,
  status: InvoiceStatus = "draft",
): SavedInvoice {
  const list = readRaw();
  const entry: SavedInvoice = {
    id: newId(),
    savedAt: new Date().toISOString(),
    invoice: migrateInvoice(invoice),
    status,
    total: computeTotal(invoice),
  };
  list.push(entry);
  writeRaw(list);
  return entry;
}

export function updateStatus(id: string, status: InvoiceStatus): boolean {
  const list = readRaw();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  list[idx] = { ...list[idx], status };
  writeRaw(list);
  return true;
}

export function deleteInvoice(id: string): boolean {
  const list = readRaw();
  const next = list.filter((e) => e.id !== id);
  if (next.length === list.length) return false;
  writeRaw(next);
  return true;
}

export function duplicateInvoice(id: string): SavedInvoice | null {
  const list = readRaw();
  const found = list.find((e) => e.id === id);
  if (!found) return null;
  const copy: SavedInvoice = {
    id: newId(),
    savedAt: new Date().toISOString(),
    invoice: migrateInvoice(found.invoice),
    status: found.status,
    total: found.total,
  };
  list.push(copy);
  writeRaw(list);
  return copy;
}
