"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { AppShell, TopbarAction } from "@/components/AppShell";
import { DashboardIcon, InvoiceIcon, PlusIcon } from "@/components/icons";
import { listInvoices, type SavedInvoice } from "@/lib/library";
import { fetchRemoteInvoices } from "@/lib/sync-client";
import { useSession } from "@/lib/auth-client";
import { MigrateBanner } from "@/components/MigrateBanner";

const serif = { fontFamily: "var(--font-display), Georgia, serif" } as const;

function fmt(n: number): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAccount = Boolean(session?.user);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (isAccount) {
      setLoading(true);
      setLoadError(null);
      fetchRemoteInvoices()
        .then((rows) => setInvoices(rows))
        .catch(() => setLoadError("Could not load dashboard"))
        .finally(() => setLoading(false));
      return;
    }
    setInvoices(listInvoices());
  }, [isAccount]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refresh();
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, [refresh]);

  const stats = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let overdue = 0;
    for (const e of invoices) {
      if (e.status === "paid") collected += e.total;
      if (e.status === "pending" || e.status === "overdue") outstanding += e.total;
      if (e.status === "overdue") overdue += 1;
    }
    return { collected, outstanding, overdue };
  }, [invoices]);

  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
        .slice(0, 5),
    [invoices],
  );

  const topClients = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of invoices) {
      const name = e.invoice.billToName?.trim() || "Unknown client";
      map.set(name, (map.get(name) ?? 0) + e.total);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [invoices]);

  const actions = (
    <>
      <TopbarAction onClick={refresh} aria-label="Refresh dashboard">
        <RefreshCw className="h-3.5 w-3.5" /> Refresh
      </TopbarAction>
      <Link
        href="/create/invoice"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0C6B4F] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#0a5a42]"
      >
        <PlusIcon size={14} /> Create Invoice
      </Link>
    </>
  );

  return (
    <AppShell
      title="Dashboard"
      icon={<DashboardIcon size={20} />}
      actions={actions}
      backHref="/"
    >
      <MigrateBanner onSynced={refresh} />
      <p className="mb-5 text-sm text-stone-500">
        Collections, outstanding invoices, and client activity.
      </p>

      {!mounted || (isAccount && loading && invoices.length === 0) ? (
        <p className="p-8 text-sm text-stone-500">Loading dashboard…</p>
      ) : loadError && invoices.length === 0 ? (
        <section className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-14 text-center shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
          <h2 className="mt-5 text-2xl tracking-tight text-[#141412]" style={serif}>
            Could not load dashboard
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Something went wrong fetching your account data.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0C6B4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a5a42]"
          >
            Retry
          </button>
        </section>
      ) : invoices.length === 0 ? (
        <section className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-14 text-center shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0C6B4F]/10 text-[#0C6B4F]">
            <InvoiceIcon size={32} />
          </span>
          <h2 className="mt-5 text-2xl tracking-tight text-[#141412]" style={serif}>
            No invoices yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Create your first invoice and it will show up here with collection
            stats and client activity.
          </p>
          <Link
            href="/create/invoice"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0C6B4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a5a42]"
          >
            Create your first invoice -&gt;
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
              <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                Collected
              </p>
              <p className="mt-2 text-3xl text-[#0C6B4F]" style={serif}>
                {fmt(stats.collected)}
              </p>
              <p className="mt-1 text-xs text-stone-500">Sum of paid invoices</p>
            </div>
            <div className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
              <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                Outstanding
              </p>
              <p className="mt-2 text-3xl text-[#141412]" style={serif}>
                {fmt(stats.outstanding)}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Pending + overdue invoices
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
              <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                Overdue
              </p>
              <p className="mt-2 text-3xl text-red-700" style={serif}>
                {stats.overdue}
              </p>
              <p className="mt-1 text-xs text-stone-500">Invoices needing follow-up</p>
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Amounts are summed as recorded across currencies.
          </p>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
              <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
                Recent invoices
              </h2>
              <ul className="mt-4 divide-y divide-stone-100">
                {recent.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">
                        {(e.invoice.prefix ?? "") + (e.invoice.serialNumber ?? "") ||
                          e.invoice.invoiceNo}
                      </p>
                      <p className="truncate text-xs text-stone-500">
                        {e.invoice.billToName} · {e.status}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-[#0C6B4F]">
                      {e.invoice.currency} {fmt(e.total)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/invoices"
                className="mt-3 inline-block text-xs font-semibold text-[#0C6B4F] hover:underline"
              >
                View all invoices -&gt;
              </Link>
            </section>

            <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
              <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
                Top clients
              </h2>
              {topClients.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">No client activity yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {topClients.map(([name, total]) => (
                    <li key={name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-semibold text-stone-900">{name}</span>
                        <span className="shrink-0 font-semibold text-[#0C6B4F]">
                          {fmt(total)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-[#0C6B4F]"
                          style={{
                            width: `${Math.max(4, (total / Math.max(1, topClients[0][1])) * 100)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
