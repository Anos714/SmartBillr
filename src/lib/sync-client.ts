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
): boolean {
  return localCount > 0 && !flag;
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
    localStorage.setItem(MIGRATED_FLAG_KEY, "1");
  } catch {
    // non-fatal
  }
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

export async function fetchRemoteInvoices(): Promise<SavedInvoice[]> {
  const res = await fetch("/api/invoices");
  if (!res.ok) throw new Error(`list_failed_${res.status}`);
  const body = (await parseJson(res)) as { invoices?: SavedInvoice[] } | null;
  return Array.isArray(body?.invoices) ? (body.invoices as SavedInvoice[]) : [];
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
): Promise<number> {
  const res = await fetch("/api/invoices/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoices: entries.map((e) => ({ invoice: e.invoice, status: e.status })),
    }),
  });
  if (!res.ok) throw new Error(`migrate_failed_${res.status}`);
  const body = (await parseJson(res)) as { migrated?: unknown } | null;
  return typeof body?.migrated === "number" ? body.migrated : entries.length;
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
