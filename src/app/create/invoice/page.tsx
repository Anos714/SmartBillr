"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ArrowLeft, Download, Share2, Trash2, Plus } from "lucide-react";
import { calcTotals } from "@/lib/invoice";
import { useGuestStore } from "@/lib/guest-store";
import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { getTemplate, canUseTemplate } from "@/components/invoice-templates/registry";
import { TemplatePicker } from "@/components/editor/TemplatePicker";
import { PaywallModal } from "@/components/editor/PaywallModal";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { name: "black", value: "#09090b" },
  { name: "blue", value: "#2563eb" },
  { name: "indigo", value: "#4f46e5" },
];

type Tab = "details" | "items" | "design";

const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900";
const labelCls =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500";

function EditorInner() {
  const searchParams = useSearchParams();
  const { invoice, updatedAt, setInvoice, updateItem, addItem, removeItem } =
    useGuestStore();
  const [tab, setTab] = useState<Tab>("details");
  const [locked, setLocked] = useState<TemplateMeta | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Honor ?template= param for free templates (guest, no login)
  useEffect(() => {
    const param = searchParams.get("template");
    if (!param) return;
    const meta = TEMPLATE_CATALOG.find((t) => t.id === param);
    if (meta && canUseTemplate(false, meta.id) && invoice.templateId !== meta.id) {
      setInvoice({ templateId: meta.id, accent: meta.accent });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totals = useMemo(
    () => calcTotals({ items: invoice.items, discountFlat: invoice.discountFlat }),
    [invoice.items, invoice.discountFlat],
  );

  const template = getTemplate(invoice.templateId);
  const PdfDocument = template.PdfDocument;
  const Preview = template.Preview;

  const savedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const pdfDoc = mounted ? (
    <PdfDocument data={invoice} totals={totals} watermark={true} />
  ) : null;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 lg:pb-0">
      {/* TopBar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link
            href="/templates"
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="hidden text-sm text-zinc-300 sm:inline">|</span>
          <span className="truncate text-sm font-semibold">{template.meta.name}</span>
          <span className="ml-auto hidden text-xs text-zinc-500 sm:inline">
            Saved {savedLabel}
          </span>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:border-zinc-400"
          >
            <Share2 className="h-4 w-4" /> {copied ? "Copied!" : "Share"}
          </button>
          {mounted && pdfDoc ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={`${invoice.invoiceNo || "invoice"}.pdf`}
              className="hidden items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-700 sm:inline-flex"
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4" />
                  {loading ? "Preparing…" : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          ) : (
            <span className="hidden items-center gap-1.5 rounded-lg bg-zinc-300 px-3 py-2 text-sm font-semibold text-white sm:inline-flex">
              <Download className="h-4 w-4" /> Download PDF
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[420px_1fr]">
        {/* Left panel */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1">
            {(["details", "items", "design"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold capitalize",
                  tab === t
                    ? "bg-white text-zinc-900 shadow"
                    : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "details" && (
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold">From</p>
                <div className="space-y-2">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      className={inputCls}
                      value={invoice.fromName}
                      onChange={(e) => setInvoice({ fromName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      value={invoice.fromEmail}
                      onChange={(e) => setInvoice({ fromEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Address</label>
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={invoice.fromAddress}
                      onChange={(e) => setInvoice({ fromAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>GSTIN (optional)</label>
                    <input
                      className={inputCls}
                      value={invoice.gstin ?? ""}
                      onChange={(e) => setInvoice({ gstin: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-bold">Bill to</p>
                <div className="space-y-2">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input
                      className={inputCls}
                      value={invoice.billToName}
                      onChange={(e) => setInvoice({ billToName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      className={inputCls}
                      value={invoice.billToEmail}
                      onChange={(e) => setInvoice({ billToEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Address</label>
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={invoice.billToAddress}
                      onChange={(e) =>
                        setInvoice({ billToAddress: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Invoice no</label>
                  <input
                    className={inputCls}
                    value={invoice.invoiceNo}
                    onChange={(e) => setInvoice({ invoiceNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select
                    className={inputCls}
                    value={invoice.currency}
                    onChange={(e) =>
                      setInvoice({
                        currency: e.target.value as typeof invoice.currency,
                      })
                    }
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Issue date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice({ issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Due date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ notes: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Terms</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={invoice.terms}
                  onChange={(e) => setInvoice({ terms: e.target.value })}
                />
              </div>
            </div>
          )}

          {tab === "items" && (
            <div className="space-y-3">
              {invoice.items.map((it) => (
                <div
                  key={it.id}
                  className="space-y-2 rounded-xl border border-zinc-200 p-3"
                >
                  <input
                    className={inputCls}
                    value={it.desc}
                    onChange={(e) =>
                      updateItem(it.id, { desc: e.target.value })
                    }
                    placeholder="Description"
                    aria-label="Item description"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>Qty</label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className={inputCls}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, { qty: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Rate</label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        className={inputCls}
                        value={it.rate}
                        onChange={(e) =>
                          updateItem(it.id, { rate: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tax%</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="any"
                        className={inputCls}
                        value={it.taxPct}
                        onChange={(e) =>
                          updateItem(it.id, { taxPct: Number(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 px-3 py-2.5 text-sm font-semibold hover:border-zinc-900"
              >
                <Plus className="h-4 w-4" /> Add item
              </button>
              <div>
                <label className={labelCls}>Discount (flat)</label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  className={inputCls}
                  value={invoice.discountFlat}
                  onChange={(e) =>
                    setInvoice({ discountFlat: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          )}

          {tab === "design" && (
            <div className="space-y-4">
              <TemplatePicker
                selectedId={invoice.templateId}
                isPro={false}
                onSelect={(t) =>
                  setInvoice({ templateId: t.id, accent: t.accent })
                }
                onLocked={(t) => setLocked(t)}
              />
              <div>
                <p className={labelCls}>Accent</p>
                <div className="flex gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      title={a.name}
                      aria-label={`Accent ${a.name}`}
                      onClick={() => setInvoice({ accent: a.value })}
                      className={cn(
                        "h-8 w-8 rounded-full border-2",
                        invoice.accent === a.value
                          ? "border-zinc-900"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: a.value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right: live preview */}
        <section className="overflow-auto rounded-2xl border border-zinc-200 bg-zinc-100 p-4 sm:p-6">
          <Preview data={invoice} totals={totals} watermark={true} />
        </section>
      </main>

      {/* Mobile sticky bottom download bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Saved {savedLabel}</span>
          {mounted && pdfDoc ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={`${invoice.invoiceNo || "invoice"}.pdf`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white"
            >
              {({ loading }) => (
                <>
                  <Download className="h-4 w-4" />
                  {loading ? "Preparing…" : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          ) : (
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-300 px-4 py-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" /> Download PDF
            </span>
          )}
        </div>
      </div>

      <PaywallModal
        templateName={locked?.name ?? ""}
        open={locked !== null}
        onClose={() => setLocked(null)}
      />
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading editor…</div>}>
      <EditorInner />
    </Suspense>
  );
}
