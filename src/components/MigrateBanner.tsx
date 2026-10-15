"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  countGuestInvoices,
  migrateGuestInvoices,
  readGuestInvoices,
  readMigratedFlag,
  setMigratedFlag,
  shouldShowMigrate,
} from "@/lib/sync-client";

export function MigrateBanner({ onSynced }: { onSynced?: () => void }) {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!session?.user) {
        setVisible(false);
        return;
      }
      const n = countGuestInvoices();
      setCount(n);
      setVisible(shouldShowMigrate(n, readMigratedFlag()));
    });
    return () => cancelAnimationFrame(id);
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!visible) return null;

  const handleSync = async () => {
    setBusy(true);
    try {
      const entries = readGuestInvoices();
      const n = await migrateGuestInvoices(entries);
      setMigratedFlag();
      setVisible(false);
      setToast(`Synced ${n} invoice${n === 1 ? "" : "s"} to account`);
      onSynced?.();
    } catch {
      setToast("Sync failed — try again");
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    setMigratedFlag();
    setVisible(false);
  };

  return (
    <div className="mb-4 rounded-2xl border border-[#0C6B4F]/30 bg-[#0C6B4F]/5 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-sm font-semibold text-stone-800">
          You have {count} guest invoice{count === 1 ? "" : "s"} — Sync to
          account
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={busy}
            className="rounded-lg bg-[#0C6B4F] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0a5a42] disabled:opacity-50"
          >
            {busy ? "Syncing…" : "Sync"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg border border-[#E7E2D8] px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F]"
          >
            Dismiss
          </button>
        </div>
      </div>
      {toast ? (
        <p role="status" className="mt-2 text-xs font-semibold text-stone-600">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
