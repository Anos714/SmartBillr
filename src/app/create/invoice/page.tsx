"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Trash2, Share2 } from "lucide-react";
import { calcTotals, invoiceDisplayNo } from "@/lib/invoice";
import { BackButton } from "@/components/BackButton";
import { useGuestStore, type MetaTarget } from "@/lib/guest-store";
import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { getTemplate, canUseTemplate } from "@/components/invoice-templates/registry";
import { TemplatePicker } from "@/components/editor/TemplatePicker";
import { PaywallModal } from "@/components/editor/PaywallModal";
import {
  DownloadIcon,
  PlusIcon,
  InvoiceIcon,
  CheckIcon,
  PaletteIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const BASE_COLORS = [
  { name: "green", value: "#0C6B4F" },
  { name: "navy", value: "#1e3a8a" },
  { name: "ink", value: "#141412" },
  { name: "violet", value: "#7c3aed" },
];

const inputCls =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0C6B4F] focus:ring-1 focus:ring-[#0C6B4F]";
const labelCls =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500";
const cardCls =
  "rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(20,20,18,0.05)] sm:p-5";
const titleCls = "font-serif text-lg font-bold text-stone-900";

function MetaRows({ target, title }: { target: MetaTarget; title: string }) {
  const invoice = useGuestStore((s) => s.invoice);
  const updateMeta = useGuestStore((s) => s.updateMeta);
  const removeMeta = useGuestStore((s) => s.removeMeta);
  const addMeta = useGuestStore((s) => s.addMeta);
  const rows = invoice[target] ?? [];
  return (
    <div>
      <p className={labelCls}>{title}</p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Label"
              value={row.label}
              aria-label={`${title} label ${i + 1}`}
              onChange={(e) => updateMeta(target, i, { label: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Value"
              value={row.value}
              aria-label={`${title} value ${i + 1}`}
              onChange={(e) => updateMeta(target, i, { value: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeMeta(target, i)}
              aria-label={`Remove ${title} row ${i + 1}`}
              className="shrink-0 rounded-lg border border-stone-200 px-2 text-stone-400 hover:border-red-300 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addMeta(target)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C6B4F] hover:underline"
        >
          <PlusIcon size={14} /> Add row
        </button>
      </div>
    </div>
  );
}

function EditorInner() {
  const searchParams = useSearchParams();
  const {
    invoice,
    updatedAt,
    setInvoice,
    updateItem,
    addItem,
    removeItem,
    addAdjustment,
    updateAdjustment,
    removeAdjustment,
    saveAsDefault,
  } = useGuestStore();
  const [locked, setLocked] = useState<TemplateMeta | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedDefault, setSavedDefault] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
    () =>
      calcTotals({
        items: invoice.items,
        discountFlat: invoice.discountFlat,
        adjustments: invoice.adjustments ?? [],
      }),
    [invoice.items, invoice.discountFlat, invoice.adjustments],
  );

  const template = getTemplate(invoice.templateId);
  const PdfDocument = template.PdfDocument;
  const Preview = template.Preview;

  const savedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const displayNo = invoiceDisplayNo({
    prefix: invoice.prefix ?? "",
    serialNumber: invoice.serialNumber ?? "",
    invoiceNo: invoice.invoiceNo,
  });

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

  const setPrefixSerial = (prefix: string, serial: string) => {
    setInvoice({
      prefix,
      serialNumber: serial,
      invoiceNo: `${prefix}${serial}`,
    });
  };

  const handleSaveDefault = () => {
    saveAsDefault();
    setSavedDefault(true);
    setTimeout(() => setSavedDefault(false), 2000);
  };

  const pdfDoc = mounted ? (
    <PdfDocument data={invoice} totals={totals} watermark={true} />
  ) : null;
  const fileName = `${displayNo || "invoice"}.pdf`;

  return (
    <div className="min-h-screen bg-[#F7F5F0] pb-24 lg:pb-0">
      {/* Floating dark topbar pill */}
      <div className="sticky top-3 z-30 px-4">
        <header className="mx-auto flex max-w-5xl items-center gap-2 rounded-full bg-[#141412] py-2 pl-4 pr-2 text-white shadow-lg">
          <BackButton href="/templates" className="border-white/15 text-white/80" />
          <span className="inline-flex items-center gap-1.5 truncate text-sm font-semibold">
            <InvoiceIcon size={18} className="shrink-0 text-emerald-300" />
            <span className="hidden sm:inline">{template.meta.name}</span>
            <span className="sm:hidden">{displayNo}</span>
          </span>
          <span className="ml-auto hidden items-center gap-1 text-xs text-white/60 md:inline-flex">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Saved {savedLabel}
          </span>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-white/90 hover:border-white/40"
          >
            <Share2 className="h-4 w-4" /> {copied ? "Copied!" : "Share"}
          </button>
          {mounted && pdfDoc ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={fileName}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0C6B4F] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#0a5a42]"
            >
              {({ loading }) => (
                <>
                  <DownloadIcon size={16} />
                  {loading ? "Preparing…" : "Download"}
                </>
              )}
            </PDFDownloadLink>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/60">
              <DownloadIcon size={16} /> Download
            </span>
          )}
        </header>
      </div>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[440px_1fr]">
        {/* Left panel: stacked cards */}
        <section className="space-y-4">
          {/* Business */}
          <div className={cardCls}>
            <h2 className={titleCls}>Business</h2>
            <p className="mb-3 text-xs text-stone-500">Your brand shown on the invoice.</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Logo URL</label>
                <div className="flex items-center gap-3">
                  <input
                    className={inputCls}
                    placeholder="https://…/logo.png"
                    value={invoice.logoUrl ?? ""}
                    onChange={(e) => setInvoice({ logoUrl: e.target.value })}
                  />
                  {invoice.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={invoice.logoUrl}
                      alt="Logo preview"
                      className="h-10 w-10 shrink-0 rounded-lg border border-stone-200 object-contain"
                    />
                  ) : null}
                </div>
              </div>
              <div>
                <label className={labelCls}>Name</label>
                <input
                  className={inputCls}
                  value={invoice.fromName}
                  onChange={(e) => setInvoice({ fromName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    className={inputCls}
                    value={invoice.fromEmail}
                    onChange={(e) => setInvoice({ fromEmail: e.target.value })}
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
              <div>
                <label className={labelCls}>Address</label>
                <textarea
                  className={inputCls}
                  rows={2}
                  value={invoice.fromAddress}
                  onChange={(e) => setInvoice({ fromAddress: e.target.value })}
                />
              </div>
              <MetaRows target="companyMeta" title="Business details" />
              <button
                type="button"
                onClick={handleSaveDefault}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0C6B4F]/30 px-3 py-1.5 text-xs font-semibold text-[#0C6B4F] hover:bg-[#0C6B4F]/5"
              >
                {savedDefault ? <CheckIcon size={14} /> : null}
                {savedDefault ? "Saved as default!" : "Save as default"}
              </button>
            </div>
          </div>

          {/* Client */}
          <div className={cardCls}>
            <h2 className={titleCls}>Client</h2>
            <p className="mb-3 text-xs text-stone-500">Who is this invoice for?</p>
            <div className="space-y-3">
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
                  onChange={(e) => setInvoice({ billToAddress: e.target.value })}
                />
              </div>
              <MetaRows target="clientMeta" title="Client details" />
            </div>
          </div>

          {/* Invoice */}
          <div className={cardCls}>
            <h2 className={titleCls}>Invoice</h2>
            <p className="mb-3 text-xs text-stone-500">
              Number preview: <span className="font-bold text-stone-800">{displayNo || "INV-0001"}</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Prefix</label>
                <input
                  className={inputCls}
                  value={invoice.prefix ?? ""}
                  placeholder="INV-"
                  onChange={(e) => setPrefixSerial(e.target.value, invoice.serialNumber ?? "")}
                />
              </div>
              <div>
                <label className={labelCls}>Serial</label>
                <input
                  className={inputCls}
                  value={invoice.serialNumber ?? ""}
                  placeholder="0001"
                  onChange={(e) => setPrefixSerial(invoice.prefix ?? "", e.target.value)}
                />
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
              <div>
                <label className={labelCls}>Currency</label>
                <select
                  className={inputCls}
                  value={invoice.currency}
                  onChange={(e) =>
                    setInvoice({ currency: e.target.value as typeof invoice.currency })
                  }
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Payment terms</label>
                <input
                  className={inputCls}
                  placeholder="Net 14"
                  value={invoice.paymentTerms ?? ""}
                  onChange={(e) => setInvoice({ paymentTerms: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className={cardCls}>
            <h2 className={titleCls}>Items</h2>
            <p className="mb-3 text-xs text-stone-500">Name + description per row.</p>
            <div className="space-y-3">
              {invoice.items.map((it) => (
                <div key={it.id} className="space-y-2 rounded-xl border border-stone-200 p-3">
                  <input
                    className={cn(inputCls, "font-semibold")}
                    value={it.name}
                    onChange={(e) => updateItem(it.id, { name: e.target.value })}
                    placeholder="Item name"
                    aria-label="Item name"
                  />
                  <textarea
                    className={inputCls}
                    rows={1}
                    value={it.description ?? ""}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                    placeholder="Description (optional)"
                    aria-label="Item description"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className={labelCls}>Qty</label>
                      <input
                        type="number" min={0} step="any" className={inputCls}
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Rate</label>
                      <input
                        type="number" min={0} step="any" className={inputCls}
                        value={it.rate}
                        onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tax%</label>
                      <input
                        type="number" min={0} max={100} step="any" className={inputCls}
                        value={it.taxPct}
                        onChange={(e) => updateItem(it.id, { taxPct: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>HSN</label>
                      <input
                        className={inputCls}
                        value={it.hsn ?? ""}
                        placeholder="—"
                        onChange={(e) => updateItem(it.id, { hsn: e.target.value })}
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
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0C6B4F] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#0a5a42]"
              >
                <PlusIcon size={16} /> Add item
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className={cardCls}>
            <h2 className={titleCls}>Totals</h2>
            <p className="mb-3 text-xs text-stone-500">Discounts, taxes, shipping & payment.</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Discount (flat)</label>
                <input
                  type="number" min={0} step="any" className={inputCls}
                  value={invoice.discountFlat}
                  onChange={(e) => setInvoice({ discountFlat: Number(e.target.value) })}
                />
              </div>
              <div>
                <p className={labelCls}>Adjustments (discount / tax / shipping)</p>
                <div className="space-y-2">
                  {(invoice.adjustments ?? []).map((a) => (
                    <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 p-2">
                      <input
                        className="min-w-[100px] flex-1 rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-[#0C6B4F]"
                        value={a.label}
                        placeholder="Label (e.g. GST 18%)"
                        aria-label="Adjustment label"
                        onChange={(e) => updateAdjustment(a.id, { label: e.target.value })}
                      />
                      <input
                        type="number" step="any"
                        className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-sm outline-none focus:border-[#0C6B4F]"
                        value={a.value}
                        aria-label="Adjustment value"
                        onChange={(e) => updateAdjustment(a.id, { value: Number(e.target.value) })}
                      />
                      <div className="flex overflow-hidden rounded-lg border border-stone-200 text-xs font-semibold">
                        {(["percentage", "fixed"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateAdjustment(a.id, { type: t })}
                            className={cn(
                              "px-2 py-1.5",
                              a.type === t ? "bg-[#0C6B4F] text-white" : "text-stone-500",
                            )}
                          >
                            {t === "percentage" ? "%" : "₹"}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAdjustment(a.id)}
                        aria-label="Remove adjustment"
                        className="rounded-lg border border-stone-200 px-2 py-1.5 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAdjustment}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C6B4F] hover:underline"
                  >
                    <PlusIcon size={14} /> Add adjustment
                  </button>
                </div>
              </div>
              <MetaRows target="paymentInfo" title="Payment info (bank / UPI)" />
              <div>
                <label className={labelCls}>Signature image URL (optional)</label>
                <input
                  className={inputCls}
                  placeholder="https://…/signature.png"
                  value={invoice.signatureUrl ?? ""}
                  onChange={(e) => setInvoice({ signatureUrl: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea className={inputCls} rows={2} value={invoice.notes}
                    onChange={(e) => setInvoice({ notes: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Terms</label>
                  <textarea className={inputCls} rows={2} value={invoice.terms}
                    onChange={(e) => setInvoice({ terms: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* Design */}
          <div className={cardCls}>
            <h2 className={titleCls}>Design</h2>
            <p className="mb-3 flex items-center gap-1 text-xs text-stone-500">
              <PaletteIcon size={14} /> Template, color, mode & font.
            </p>
            <div className="space-y-4">
              <TemplatePicker
                selectedId={invoice.templateId}
                isPro={false}
                onSelect={(t) => setInvoice({ templateId: t.id, accent: t.accent })}
                onLocked={(t) => setLocked(t)}
              />
              <div>
                <p className={labelCls}>Brand color</p>
                <div className="flex gap-2">
                  {BASE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      aria-label={`Brand color ${c.name}`}
                      onClick={() =>
                        setInvoice({
                          theme: { ...(invoice.theme ?? { mode: "light", font: "geist" }), baseColor: c.value },
                          accent: c.value,
                        })
                      }
                      className={cn(
                        "h-8 w-8 rounded-full border-2",
                        (invoice.theme?.baseColor ?? invoice.accent) === c.value
                          ? "border-[#0C6B4F] ring-2 ring-[#0C6B4F]/30"
                          : "border-transparent",
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Mode</p>
                  <div className="flex overflow-hidden rounded-lg border border-stone-200 text-sm font-semibold">
                    {(["light", "dark"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() =>
                          setInvoice({ theme: { ...(invoice.theme ?? { baseColor: "#0C6B4F", font: "geist" }), mode: m } })
                        }
                        className={cn(
                          "flex-1 px-3 py-2 capitalize",
                          (invoice.theme?.mode ?? "light") === m
                            ? "bg-[#141412] text-white"
                            : "text-stone-500",
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={labelCls}>Font</p>
                  <select
                    className={inputCls}
                    value={invoice.theme?.font ?? "geist"}
                    onChange={(e) =>
                      setInvoice({
                        theme: {
                          ...(invoice.theme ?? { baseColor: "#0C6B4F", mode: "light" }),
                          font: e.target.value as "geist" | "inter" | "serif",
                        },
                      })
                    }
                  >
                    <option value="geist">Geist</option>
                    <option value="inter">Inter</option>
                    <option value="serif">Serif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: sticky live preview */}
        <section className="lg:sticky lg:top-20 lg:self-start">
          <div className="overflow-auto rounded-2xl border border-stone-200 bg-white/60 p-4 sm:p-6">
            <Preview data={invoice} totals={totals} watermark={true} />
          </div>
        </section>
      </main>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500">Saved {savedLabel}</span>
          {mounted && pdfDoc ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={fileName}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0C6B4F] px-4 py-3 text-sm font-semibold text-white"
            >
              {({ loading }) => (
                <>
                  <DownloadIcon size={16} />
                  {loading ? "Preparing…" : "Download PDF"}
                </>
              )}
            </PDFDownloadLink>
          ) : (
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-300 px-4 py-3 text-sm font-semibold text-white">
              <DownloadIcon size={16} /> Download PDF
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
