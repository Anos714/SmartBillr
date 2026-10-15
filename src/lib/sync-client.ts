import type { InvoiceData } from "./invoice";
import { LIBRARY_KEY, type InvoiceStatus, type SavedInvoice } from "./library";

export const MIGRATED_FLAG_KEY = "smartbillr_migrated";
export const GUEST_INVOICES_KEY = LIBRARY_KEY;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Pure helper: show the one-time guest-migration banner. */
export function shouldShowMigrate(
  localCount: number,
  flag: string | null,
  newestSavedAt?: string | null,
): boolean {
  if (localCount <= 0) return false;
  if (!flag) return true;
  // Stale flag: a guest invoice saved after the dismiss/sync timestamp
  // re-arms the banner (see clearStaleMigratedFlag in library.ts — this
  // is the belt-and-suspenders check for flags that were never cleared).
  if (newestSavedAt) {
    const flagTime = Date.parse(flag);
    if (Number.isFinite(flagTime) && newestSavedAt > new Date(flagTime).toISOString()) {
      return true;
    }
  }
  return false;
}

export function readMigratedFlag(): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(MIGRATED_FLAG_KEY);
  } catch {
    return null;
  }
}

export function setMigratedFlag(): void {
  if (!isBrowser()) return;
  try {
    // Store a timestamp so a later guest save can detect staleness.
    localStorage.setItem(MIGRATED_FLAG_KEY, new Date().toISOString());
  } catch {
    // non-fatal
  }
}

export function newestGuestSavedAt(): string | null {
  const entries = readGuestInvoices();
  let newest: string | null = null;
  for (const e of entries) {
    if (typeof e.savedAt === "string" && e.savedAt && (!newest || e.savedAt > newest)) {
      newest = e.savedAt;
    }
  }
  return newest;
}

export function countGuestInvoices(): number {
  if (!isBrowser()) return 0;
  try {
    const raw = localStorage.getItem(GUEST_INVOICES_KEY);
    if (!raw) return 0;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export function readGuestInvoices(): SavedInvoice[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(GUEST_INVOICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedInvoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function parseJson(res: Response): Promise<unknown> {
  try {
    return (await res.json()) as unknown;
  } catch {
    return null;
  }
}

export type FetchInvoicesOptions = {
  limit?: number;
  offset?: number;
  status?: InvoiceStatus;
};

export type FetchInvoicesResult = {
  invoices: SavedInvoice[];
  total: number;
};

export async function fetchRemoteInvoices(
  opts: FetchInvoicesOptions = {},
): Promise<FetchInvoicesResult> {
  const params = new URLSearchParams();
  if (opts.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts.offset !== undefined) params.set("offset", String(opts.offset));
  if (opts.status !== undefined) params.set("status", opts.status);
  const qs = params.toString();
  const res = await fetch(`/api/invoices${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error(`list_failed_${res.status}`);
  const body = (await parseJson(res)) as {
    invoices?: SavedInvoice[];
    total?: unknown;
  } | null;
  const invoices = Array.isArray(body?.invoices)
    ? (body.invoices as SavedInvoice[])
    : [];
  const total =
    typeof body?.total === "number" && Number.isFinite(body.total)
      ? body.total
      : invoices.length;
  return { invoices, total };
}

export async function saveRemoteInvoice(
  invoice: InvoiceData,
  status: InvoiceStatus = "draft",
): Promise<string> {
  const res = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice, status }),
  });
  if (!res.ok) throw new Error(`save_failed_${res.status}`);
  const body = (await parseJson(res)) as { id?: unknown } | null;
  if (!body || typeof body.id !== "string") throw new Error("save_no_id");
  return body.id;
}

export async function duplicateRemoteInvoice(
  entry: SavedInvoice,
): Promise<string> {
  return saveRemoteInvoice(entry.invoice, entry.status);
}

export async function patchRemoteInvoice(
  id: string,
  invoice: InvoiceData,
  status?: InvoiceStatus,
): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      status !== undefined ? { invoice, status } : { invoice },
    ),
  });
  if (!res.ok) throw new Error(`save_failed_${res.status}`);
}

export async function patchRemoteStatus(
  id: string,
  status: InvoiceStatus,
): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`status_failed_${res.status}`);
}

export async function deleteRemoteInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`delete_failed_${res.status}`);
}

export async function migrateGuestInvoices(
  entries: SavedInvoice[],
): Promise<{ migrated: number; skipped: number }> {
  const res = await fetch("/api/invoices/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoices: entries.map((e) => ({
        invoice: e.invoice,
        status: e.status,
        clientId: e.id,
      })),
    }),
  });
  if (!res.ok) throw new Error(`migrate_failed_${res.status}`);
  const body = (await parseJson(res)) as {
    migrated?: unknown;
    skipped?: unknown;
  } | null;
  return {
    migrated:
      typeof body?.migrated === "number" ? body.migrated : entries.length,
    skipped: typeof body?.skipped === "number" ? body.skipped : 0,
  };
}

export type RemoteAsset = {
  id: string;
  type: string;
  url: string;
  publicId?: string | null;
};

export async function fetchRemoteAssets(): Promise<RemoteAsset[]> {
  const res = await fetch("/api/assets-db");
  if (!res.ok) throw new Error(`assets_failed_${res.status}`);
  const body = (await parseJson(res)) as { assets?: RemoteAsset[] } | null;
  return Array.isArray(body?.assets) ? (body.assets as RemoteAsset[]) : [];
}

export async function createRemoteAsset(input: {
  type: string;
  url: string;
  publicId?: string;
}): Promise<RemoteAsset> {
  const res = await fetch("/api/assets-db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`asset_save_failed_${res.status}`);
  const body = (await parseJson(res)) as { asset?: RemoteAsset } | null;
  if (!body?.asset) throw new Error("asset_no_row");
  return body.asset;
}

export async function deleteRemoteAsset(id: string): Promise<void> {
  const res = await fetch(`/api/assets-db/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`asset_delete_failed_${res.status}`);
}
