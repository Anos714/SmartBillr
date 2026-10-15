"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { AppShell, TopbarAction } from "@/components/AppShell";
import { DashboardIcon, PlusIcon } from "@/components/icons";
import { CustomSelect } from "@/components/ui/select";
import { TrendsAreaChart } from "@/components/evilcharts/area-chart";
import { listInvoices, type SavedInvoice } from "@/lib/library";
import { formatMoney } from "@/lib/money";
import {
  currencies,
  monthlySeries,
  overview,
  topClients,
} from "@/lib/stats";
import { fetchRemoteInvoices } from "@/lib/sync-client";
import { useSession } from "@/lib/auth-client";
import { MigrateBanner } from "@/components/MigrateBanner";

const serif = { fontFamily: "var(--font-display), Georgia, serif" } as const;

/** Deterministic fallback so prerender never reads the current time. */
const FALLBACK_NOW = new Date(0);

type RangeOpt = "6" | "12";

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAccount = Boolean(session?.user);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOpt>("6");
  const [now, setNow] = useState<Date | null>(null);

  const refresh = useCallback(() => {
    if (isAccount) {
      setLoading(true);
      setLoadError(null);
      fetchRemoteInvoices({ limit: 200, offset: 0 })
        .then(({ invoices: rows }) => setInvoices(rows))
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
      // Read the clock here (not during render) so prerender stays
      // deterministic — Next flags `new Date()` evaluated during prerender.
      setNow(new Date());
    });
    return () => cancelAnimationFrame(id);
  }, [refresh]);
  const nowOrFallback = now ?? FALLBACK_NOW;

  const currencyList = useMemo(() => currencies(invoices), [invoices]);
  const activeCurrency = currency ?? currencyList[0] ?? "INR";
  const invoiceCount = useMemo(
    () => invoices.filter((e) => (e.invoice.currency || "INR") === activeCurrency).length,
    [invoices, activeCurrency],
  );

  const stats = useMemo(
    () => overview(invoices, activeCurrency, nowOrFallback),
    [invoices, activeCurrency, nowOrFallback],
  );
  const months = range === "12" ? 12 : 6;
  const series = useMemo(
    () => monthlySeries(invoices, months, activeCurrency, nowOrFallback),
    [invoices, months, activeCurrency, nowOrFallback],
  );
  const seriesTotals = useMemo(
    () => ({
      billed: series.reduce((a, p) => a + p.billed, 0),
      collected: series.reduce((a, p) => a + p.collected, 0),
    }),
    [series],
  );
  const hasSeriesData = seriesTotals.billed > 0 || seriesTotals.collected > 0;
  const clients = useMemo(
    () => topClients(invoices, activeCurrency, 5),
    [invoices, activeCurrency],
  );

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
          {/* Overview — all time, per currency */}
          <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
                  Overview <span className="text-stone-400">· All time</span>
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  {invoiceCount} invoice{invoiceCount === 1 ? "" : "s"} ·{" "}
                  {activeCurrency}
                </p>
              </div>
              <div className="w-36">
                <CustomSelect
                  id="overview-currency"
                  label="Currency"
                  value={activeCurrency}
                  onChange={(v) => setCurrency(v)}
                  options={currencyList.map((c) => ({ value: c, label: c }))}
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E7E2D8] bg-white/60 p-4">
                <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                  Collected
                </p>
                <p
                  className="mt-2 font-mono text-3xl text-[#0C6B4F]"
                  style={serif}
                >
                  {formatMoney(stats.collected, activeCurrency)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {stats.collectedCount} invoice
                  {stats.collectedCount === 1 ? "" : "s"} · sum of paid
                  invoices
                </p>
              </div>
              <div className="rounded-xl border border-[#E7E2D8] bg-white/60 p-4">
                <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                  Outstanding
                </p>
                <p className="mt-2 font-mono text-3xl text-[#141412]" style={serif}>
                  {formatMoney(stats.outstanding, activeCurrency)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {stats.outstandingCount} invoice
                  {stats.outstandingCount === 1 ? "" : "s"} · pending, draft
                  and overdue
                </p>
              </div>
              <div className="rounded-xl border border-[#E7E2D8] bg-white/60 p-4">
                <p className="text-xs font-bold tracking-widest text-stone-400 uppercase">
                  Overdue
                </p>
                <p className="mt-2 font-mono text-3xl text-red-700" style={serif}>
                  {formatMoney(stats.overdue, activeCurrency)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {stats.overdueCount} invoice
                  {stats.overdueCount === 1 ? "" : "s"} · past due date and
                  unpaid
                </p>
              </div>
            </div>
          </section>

          {/* Monthly trends */}
          <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl tracking-tight text-[#141412]" style={serif}>
                  Monthly trends <span className="text-stone-400">· {activeCurrency}</span>
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#0C6B4F]" />
                    Billed · {formatMoney(seriesTotals.billed, activeCurrency)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-stone-700">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#141412]" />
                    Collected · {formatMoney(seriesTotals.collected, activeCurrency)}
                  </span>
                </div>
              </div>
              <div className="w-36">
                <CustomSelect
                  id="trends-range"
                  label="Range"
                  value={range}
                  onChange={(v) => setRange(v === "12" ? "12" : "6")}
                  options={[
                    { value: "6", label: "Last 6 months" },
                    { value: "12", label: "Last 12 months" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-4">
              {hasSeriesData ? (
                <TrendsAreaChart data={series} currency={activeCurrency} />
              ) : (
                <p className="rounded-xl border border-dashed border-[#E7E2D8] bg-white/60 px-4 py-10 text-center text-sm text-stone-500">
                  No billed or collected amounts in this period.
                </p>
              )}
            </div>
            <details className="mt-3 rounded-xl border border-[#E7E2D8] bg-white/60">
              <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-[#0C6B4F]">
                Monthly figures
              </summary>
              <div className="overflow-x-auto border-t border-[#E7E2D8]">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="text-xs tracking-wide text-stone-500 uppercase">
                      <th className="px-4 py-2 font-semibold">Month</th>
                      <th className="px-4 py-2 text-right font-semibold">Billed</th>
                      <th className="px-4 py-2 text-right font-semibold">Collected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {series.map((p) => (
                      <tr key={p.month}>
                        <td className="px-4 py-2 font-semibold text-stone-800">
                          {p.month}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-stone-700">
                          {formatMoney(p.billed, activeCurrency)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-xs text-stone-700">
                          {formatMoney(p.collected, activeCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          {/* Top clients */}
          <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
            <div className="flex items-center gap-3">
              <h2 className="flex-1 text-xl tracking-tight text-[#141412]" style={serif}>
                Top clients
              </h2>
              <p className="text-xs text-stone-500">All time · {activeCurrency}</p>
            </div>
            {clients.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                No client activity in {activeCurrency} yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E7E2D8] text-xs tracking-wide text-stone-500 uppercase">
                      <th className="px-2 py-2 font-semibold">Client</th>
                      <th className="px-2 py-2 text-right font-semibold">Invoices</th>
                      <th className="px-2 py-2 text-right font-semibold">Billed</th>
                      <th className="px-2 py-2 text-right font-semibold">Collected</th>
                      <th className="px-2 py-2 text-right font-semibold">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {clients.map((c) => (
                      <tr key={`${c.name}\n${c.address}`}>
                        <td className="max-w-[220px] truncate px-2 py-2.5 font-semibold text-stone-900">
                          {c.name}
                        </td>
                        <td className="px-2 py-2.5 text-right text-stone-600">
                          {c.invoices}
                        </td>
                        <td className="px-2 py-2.5 text-right font-mono text-xs font-semibold text-stone-800">
                          {formatMoney(c.billed, activeCurrency)}
                        </td>
                        <td className="px-2 py-2.5 text-right font-mono text-xs font-semibold text-[#0C6B4F]">
                          {formatMoney(c.collected, activeCurrency)}
                        </td>
                        <td className="px-2 py-2.5 text-right font-mono text-xs text-stone-600">
                          {formatMoney(c.outstanding, activeCurrency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link
              href="/invoices"
              className="mt-3 inline-block text-xs font-semibold text-[#0C6B4F] hover:underline"
            >
              View invoices -&gt;
            </Link>
          </section>

          <p className="text-xs text-stone-400">
            Includes device + account invoices. Amounts reported separately
            per currency.
          </p>
        </div>
      )}
    </AppShell>
  );
}
