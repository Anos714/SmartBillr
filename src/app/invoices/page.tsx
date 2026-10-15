"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Plus } from "lucide-react";
import { AppShell, TopbarAction } from "@/components/AppShell";
import { CustomSelect } from "@/components/ui/select";
import { InvoiceIcon } from "@/components/icons";
import {
  deleteInvoice,
  duplicateInvoice,
  listInvoices,
  updateStatus,
  type InvoiceStatus,
  type SavedInvoice,
} from "@/lib/library";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type StatusFilter = "all" | InvoiceStatus;

const STATUS_PILL: Record<InvoiceStatus, string> = {
  draft: "bg-stone-100 text-stone-600",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-700",
};

function serialOf(e: SavedInvoice): string {
  const combined = `${e.invoice.prefix ?? ""}${e.invoice.serialNumber ?? ""}`;
  return combined.trim() || e.invoice.invoiceNo;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = () => setInvoices(listInvoices());

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refresh();
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleStatus = (v: StatusFilter) => {
    setStatus(v);
    setPage(1);
  };

  const handleQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (!q) return true;
      return (
        serialOf(e).toLowerCase().includes(q) ||
        (e.invoice.billToName ?? "").toLowerCase().includes(q) ||
        (e.invoice.billToEmail ?? "").toLowerCase().includes(q)
      );
    });
  }, [invoices, status, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = status !== "all" || query.trim() !== "";
  const clearFilters = () => {
    setStatus("all");
    setQuery("");
  };

  const handleDuplicate = (id: string) => {
    const copy = duplicateInvoice(id);
    setToast(copy ? "Duplicated" : "Duplicate failed");
    refresh();
  };

  const handleMarkPaid = (id: string) => {
    const ok = updateStatus(id, "paid");
    setToast(ok ? "Marked paid" : "Update failed");
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this invoice?")) return;
    const ok = deleteInvoice(id);
    setToast(ok ? "Deleted" : "Delete failed");
    refresh();
  };

  const actions = (
    <>
      <TopbarAction
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
      >
        <Filter className="h-3.5 w-3.5" /> Filter
      </TopbarAction>
      <Link
        href="/create/invoice"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0C6B4F] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#0a5a42]"
      >
        <Plus className="h-3.5 w-3.5" /> New Invoice
      </Link>
    </>
  );

  return (
    <AppShell
      title="Invoices"
      icon={<InvoiceIcon size={20} />}
      actions={actions}
      backHref="/dashboard"
    >
      {filtersOpen ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-4 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="status-filter"
              className="mb-1.5 block text-xs font-semibold tracking-wide text-[#3f3c37] uppercase"
            >
              Status
            </label>
            <CustomSelect
              id="status-filter"
              label="Status"
              value={status}
              onChange={(next) => handleStatus(next as StatusFilter)}
              options={[
                { value: "all", label: "All" },
                { value: "draft", label: "Draft" },
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
                { value: "overdue", label: "Overdue" },
              ]}
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="invoice-search"
              className="mb-1.5 block text-xs font-semibold tracking-wide text-[#3f3c37] uppercase"
            >
              Search
            </label>
            <input
              id="invoice-search"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search serial, client, email…"
              className="w-full rounded-xl border border-[#E7E2D8] bg-white px-3 py-2 text-sm outline-none placeholder:text-stone-400 focus:border-[#0C6B4F]"
            />
          </div>
        </div>
      ) : null}

      {!mounted ? (
        <p className="p-8 text-sm text-stone-500">Loading invoices…</p>
      ) : rows.length === 0 ? (
        <section className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0C6B4F]/10 text-[#0C6B4F]">
            <InvoiceIcon size={32} />
          </span>
          <h2
            className="mt-5 text-2xl tracking-tight text-[#141412]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            No Data Found
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            {hasFilters
              ? "No invoices match your filters. Try clearing them."
              : "You have no saved invoices yet. Create one to get started."}
          </p>
          <div className="mt-6 flex gap-2">
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-[#E7E2D8] px-5 py-2.5 text-sm font-semibold text-[#3f3c37] hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F]"
              >
                Clear filters
              </button>
            ) : null}
            <Link
              href="/create/invoice"
              className="rounded-xl bg-[#0C6B4F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5a42]"
            >
              Create invoice
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7E2D8] text-xs tracking-wide text-stone-500 uppercase">
                  <th className="px-4 py-3 font-semibold">Storage</th>
                  <th className="px-4 py-3 font-semibold">Serial No</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Invoice Date</th>
                  <th className="px-4 py-3 font-semibold">Created At</th>
                  <th className="px-4 py-3 font-semibold">Paid At</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[#0C6B4F]/25 bg-[#0C6B4F]/5 px-2 py-0.5 text-[11px] font-bold text-[#0C6B4F]">
                        local
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                      {serialOf(e)}
                    </td>
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {e.invoice.currency}{" "}
                      {e.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3">{e.invoice.items.length}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize",
                          STATUS_PILL[e.status],
                        )}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {e.invoice.issueDate || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {new Date(e.savedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {e.status === "paid"
                        ? new Date(e.savedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                        <Link
                          href={`/create/invoice?load=${e.id}`}
                          className="rounded-lg border border-[#E7E2D8] px-2 py-1 text-[#0C6B4F] hover:border-[#0C6B4F]/50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(e.id)}
                          className="rounded-lg border border-[#E7E2D8] px-2 py-1 text-stone-600 hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F]"
                        >
                          Duplicate
                        </button>
                        {e.status !== "paid" ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(e.id)}
                            className="rounded-lg border border-emerald-600/30 px-2 py-1 text-emerald-700 hover:bg-emerald-50"
                          >
                            Mark Paid
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDelete(e.id)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-stone-500">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => {
                  setPage((p) => p + 1);
                  router.refresh?.();
                }}
                className="rounded-lg border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#141412] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-xl"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
