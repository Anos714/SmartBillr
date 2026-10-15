"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Filter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
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
import { paidAtOf } from "@/lib/stats";
import {
  deleteRemoteInvoice,
  duplicateRemoteInvoice,
  fetchRemoteInvoices,
  patchRemoteStatus,
  saveRemoteInvoice,
} from "@/lib/sync-client";
import { useSession } from "@/lib/auth-client";
import { MigrateBanner } from "@/components/MigrateBanner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

type StatusFilter = "all" | InvoiceStatus;

type SortKey = "total" | "items" | "issueDate" | "savedAt" | "paidAt";
type SortDir = "asc" | "desc";

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

function sortValue(e: SavedInvoice, key: SortKey): number | string {
  switch (key) {
    case "total":
      return e.total;
    case "items":
      return e.invoice.items.length;
    case "issueDate":
      return e.invoice.issueDate || "";
    case "savedAt":
      return e.savedAt || "";
    case "paidAt":
      // Unpaid invoices have no paid-at; "" sorts first asc / last desc.
      return paidAtOf(e) ?? "";
  }
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = activeKey === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 font-semibold uppercase hover:text-[#0C6B4F]",
        active && "text-[#0C6B4F]",
      )}
      aria-label={`Sort by ${label} ${active ? (dir === "asc" ? "ascending" : "descending") : ""}`}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ArrowUp className="h-3 w-3" aria-hidden />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden />
        )
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" aria-hidden />
      )}
    </button>
  );
}

export default function InvoicesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAccount = Boolean(session?.user);
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("savedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const refresh = () => {
    if (isAccount) {
      setLoading(true);
      setLoadError(null);
      fetchRemoteInvoices()
        .then((rows) => setInvoices(rows))
        .catch(() => {
          setLoadError("Could not load invoices");
          setToast("Could not load invoices");
        })
        .finally(() => setLoading(false));
      return;
    }
    setInvoices(listInvoices());
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      refresh();
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAccount]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openMenu ]);

  const handleStatus = (v: StatusFilter) => {
    setStatus(v);
    setPage(1);
  };

  const handleQuery = (v: string) => {
    setQuery(v);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = invoices.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (!q) return true;
      return (
        serialOf(e).toLowerCase().includes(q) ||
        (e.invoice.billToName ?? "").toLowerCase().includes(q) ||
        (e.invoice.billToEmail ?? "").toLowerCase().includes(q)
      );
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") {
        if (va !== vb) return (va - vb) * dir;
      } else {
        const cmp = String(va).localeCompare(String(vb));
        if (cmp !== 0) return cmp * dir;
      }
      return a.id.localeCompare(b.id);
    });
  }, [invoices, status, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasFilters = status !== "all" || query.trim() !== "";
  const clearFilters = () => {
    setStatus("all");
    setQuery("");
  };

  const closeMenu = () => setOpenMenu(null);

  const handleDuplicate = (id: string) => {
    closeMenu();
    if (isAccount) {
      const entry = invoices.find((e) => e.id === id);
      if (!entry) {
        setToast("Duplicate failed");
        return;
      }
      duplicateRemoteInvoice(entry)
        .then(() => setToast("Duplicated"))
        .catch(() => setToast("Duplicate failed"))
        .finally(() => refresh());
      return;
    }
    const copy = duplicateInvoice(id);
    setToast(copy ? "Duplicated" : "Duplicate failed");
    refresh();
  };

  const handleSetStatus = (id: string, next: InvoiceStatus) => {
    closeMenu();
    if (isAccount) {
      patchRemoteStatus(id, next)
        .then(() => setToast(next === "paid" ? "Marked paid" : "Marked pending"))
        .catch(() => setToast("Update failed"))
        .finally(() => refresh());
      return;
    }
    const ok = updateStatus(id, next);
    setToast(ok ? (next === "paid" ? "Marked paid" : "Marked pending") : "Update failed");
    refresh();
  };

  const handleDelete = (id: string) => {
    closeMenu();
    if (!window.confirm("Delete this invoice?")) return;
    if (isAccount) {
      deleteRemoteInvoice(id)
        .then(() => setToast("Deleted"))
        .catch(() => setToast("Delete failed"))
        .finally(() => refresh());
      return;
    }
    const ok = deleteInvoice(id);
    setToast(ok ? "Deleted" : "Delete failed");
    refresh();
  };

  /** Local → server only. (Server → device move is intentionally not
   * implemented: account rows stay canonical; guests use the sync banner.) */
  const handleMoveToServer = (id: string) => {
    closeMenu();
    const entry = invoices.find((e) => e.id === id);
    if (!entry) {
      setToast("Move failed");
      return;
    }
    saveRemoteInvoice(entry.invoice, entry.status)
      .then(() => {
        deleteInvoice(id);
        setToast("Moved to server");
      })
      .catch(() => setToast("Sign in to move invoices to your account"))
      .finally(() => refresh());
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

  const menuItemClass =
    "flex w-full items-center rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-stone-700 transition hover:bg-[#0C6B4F]/5 hover:text-[#0C6B4F]";

  return (
    <AppShell
      title="Invoices"
      icon={<InvoiceIcon size={20} />}
      actions={actions}
      backHref="/dashboard"
    >
      <MigrateBanner onSynced={refresh} />
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

      {!mounted || (isAccount && loading && invoices.length === 0) ? (
        <p className="p-8 text-sm text-stone-500">Loading invoices…</p>
      ) : loadError && invoices.length === 0 ? (
        <section className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-14 text-center">
          <h2
            className="mt-5 text-2xl tracking-tight text-[#141412]"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Could not load invoices
          </h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Something went wrong fetching your account invoices.
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-6 rounded-xl bg-[#0C6B4F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5a42]"
          >
            Retry
          </button>
        </section>
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
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7E2D8] text-xs tracking-wide text-stone-500 uppercase">
                  <th className="px-4 py-3 font-semibold">Storage</th>
                  <th className="px-4 py-3 font-semibold">Serial No</th>
                  <th className="px-4 py-3 font-semibold">
                    <SortHeader label="Total" sortKey="total" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <SortHeader label="Items" sortKey="items" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">
                    <SortHeader label="Invoice Date" sortKey="issueDate" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <SortHeader label="Created At" sortKey="savedAt" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    <SortHeader label="Paid At" sortKey="paidAt" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((e) => {
                  const paidAt = paidAtOf(e);
                  return (
                    <tr key={e.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3">
                        {isAccount ? (
                          <span className="rounded-full border border-[#0C6B4F]/25 bg-[#0C6B4F]/5 px-2 py-0.5 text-[11px] font-bold text-[#0C6B4F]">
                            Account
                          </span>
                        ) : (
                          <span className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600">
                            Local
                          </span>
                        )}
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
                        {paidAt ? new Date(paidAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/create/invoice?load=${e.id}`}
                            className="rounded-lg border border-[#E7E2D8] px-2 py-1 text-xs font-semibold text-[#0C6B4F] hover:border-[#0C6B4F]/50"
                          >
                            View
                          </Link>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu((m) => (m === e.id ? null : e.id))
                              }
                              aria-label={`More actions for ${serialOf(e)}`}
                              aria-expanded={openMenu === e.id}
                              className="rounded-lg border border-[#E7E2D8] px-2 py-1 text-xs font-semibold text-stone-600 hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F]"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                            </button>
                            {openMenu === e.id ? (
                              <>
                                <button
                                  type="button"
                                  aria-label="Close menu"
                                  onClick={closeMenu}
                                  className="fixed inset-0 z-30 cursor-default bg-transparent"
                                />
                                <div
                                  role="menu"
                                  className="absolute top-full right-0 z-40 mt-2 w-44 animate-[menu-pop_.14s_ease-out] rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(20,20,18,0.45)] backdrop-blur"
                                >
                                  {e.status !== "paid" ? (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => handleSetStatus(e.id, "paid")}
                                      className={menuItemClass}
                                    >
                                      Mark Paid
                                    </button>
                                  ) : null}
                                  {e.status !== "pending" ? (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => handleSetStatus(e.id, "pending")}
                                      className={menuItemClass}
                                    >
                                      Mark Pending
                                    </button>
                                  ) : null}
                                  <Link
                                    href={`/create/invoice?load=${e.id}`}
                                    role="menuitem"
                                    onClick={closeMenu}
                                    className={menuItemClass}
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => handleDuplicate(e.id)}
                                    className={menuItemClass}
                                  >
                                    Duplicate
                                  </button>
                                  {!isAccount ? (
                                    <button
                                      type="button"
                                      role="menuitem"
                                      onClick={() => handleMoveToServer(e.id)}
                                      className={menuItemClass}
                                    >
                                      Move to server
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => handleDelete(e.id)}
                                    className="flex w-full items-center rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    Delete Invoice
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
