import type { SavedInvoice } from "./library";
import { round2 } from "./invoice";

export { round2 };

/**
 * Dashboard statistics — pure functions over `SavedInvoice[]`.
 *
 * Rules (mirror the Invoicely README conventions):
 * - Amounts are bucketed PER CURRENCY and never mixed. Every helper takes
 *   a `currency` and only considers invoices in that currency.
 * - No refunds exist in our model, so there is nothing to exclude.
 * - Partial payments are unsupported: an invoice is either fully
 *   collected (status `paid`) or fully outstanding.
 * - All money is rounded to 2dp.
 */

export type Overview = {
  collected: number;
  collectedCount: number;
  outstanding: number;
  outstandingCount: number;
  overdue: number;
  overdueCount: number;
};

export type MonthPoint = {
  /** Short month label, e.g. "May". */
  month: string;
  billed: number;
  collected: number;
};

export type TopClient = {
  name: string;
  address: string;
  invoices: number;
  billed: number;
  collected: number;
  outstanding: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function currencyOf(e: SavedInvoice): string {
  return e.invoice.currency || "INR";
}

/**
 * When an invoice was paid. Prefers the explicit `paidAt` (set on local
 * mark-paid, derived from `updatedAt` for DB rows); falls back to `savedAt`
 * for paid invoices without one; null when unpaid.
 */
export function paidAtOf(e: SavedInvoice): string | null {
  if (e.paidAt) return e.paidAt;
  if (e.status === "paid") return e.savedAt;
  return null;
}

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Past dueDate and not paid. Compares date-only (`YYYY-MM-DD` strings
 * compare lexicographically): due today is NOT overdue. A stored `overdue`
 * status also counts even without a past due date (manually flagged).
 */
export function isOverdue(e: SavedInvoice, now: Date = new Date()): boolean {
  if (e.status === "paid") return false;
  const due = (e.invoice.dueDate || "").slice(0, 10);
  if (due && due < toISODateLocal(now)) return true;
  return e.status === "overdue";
}

/** All-time totals for one currency. Outstanding = every unpaid invoice. */
export function overview(
  invoices: SavedInvoice[],
  currency: string,
  now: Date = new Date(),
): Overview {
  let collected = 0;
  let collectedCount = 0;
  let outstanding = 0;
  let outstandingCount = 0;
  let overdue = 0;
  let overdueCount = 0;
  for (const e of invoices) {
    if (currencyOf(e) !== currency) continue;
    if (e.status === "paid") {
      collected += e.total;
      collectedCount += 1;
      continue;
    }
    outstanding += e.total;
    outstandingCount += 1;
    if (isOverdue(e, now)) {
      overdue += e.total;
      overdueCount += 1;
    }
  }
  return {
    collected: round2(collected),
    collectedCount,
    outstanding: round2(outstanding),
    outstandingCount,
    overdue: round2(overdue),
    overdueCount,
  };
}

/**
 * Per-month buckets for the last `months` calendar months (incl. the month
 * of `now`). `billed` uses the invoice issue date; `collected` uses the
 * paid-at date and only counts paid invoices.
 */
export function monthlySeries(
  invoices: SavedInvoice[],
  months: 6 | 12,
  currency: string,
  now: Date = new Date(),
): MonthPoint[] {
  const buckets: { key: string; label: string; billed: number; collected: number }[] =
    [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: MONTH_LABELS[d.getMonth()]!,
      billed: 0,
      collected: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const e of invoices) {
    if (currencyOf(e) !== currency) continue;
    const billedKey = (e.invoice.issueDate || "").slice(0, 7);
    const billedBucket = byKey.get(billedKey);
    if (billedBucket) billedBucket.billed += e.total;
    if (e.status === "paid") {
      const paidKey = (paidAtOf(e) || "").slice(0, 7);
      const paidBucket = byKey.get(paidKey);
      if (paidBucket) paidBucket.collected += e.total;
    }
  }
  return buckets.map((b) => ({
    month: b.label,
    billed: round2(b.billed),
    collected: round2(b.collected),
  }));
}

function normalizeKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Top clients for one currency, grouped by normalized name + address. */
export function topClients(
  invoices: SavedInvoice[],
  currency: string,
  limit = 5,
): TopClient[] {
  const map = new Map<
    string,
    { name: string; address: string; invoices: number; billed: number; collected: number }
  >();
  for (const e of invoices) {
    if (currencyOf(e) !== currency) continue;
    const rawName = (e.invoice.billToName || "").trim();
    const rawAddr = (e.invoice.billToAddress || "").trim();
    const key = `${normalizeKey(rawName || "unknown")}\n${normalizeKey(rawAddr)}`;
    let row = map.get(key);
    if (!row) {
      row = {
        name: rawName || "Unknown client",
        address: rawAddr,
        invoices: 0,
        billed: 0,
        collected: 0,
      };
      map.set(key, row);
    }
    row.invoices += 1;
    row.billed += e.total;
    if (e.status === "paid") row.collected += e.total;
  }
  return [...map.values()]
    .map((r) => ({
      name: r.name,
      address: r.address,
      invoices: r.invoices,
      billed: round2(r.billed),
      collected: round2(r.collected),
      outstanding: round2(r.billed - r.collected),
    }))
    .sort((a, b) => b.billed - a.billed)
    .slice(0, limit);
}

/** Distinct currencies present, sorted. */
export function currencies(invoices: SavedInvoice[]): string[] {
  const set = new Set<string>();
  for (const e of invoices) set.add(currencyOf(e));
  return [...set].sort();
}
