"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import "@/lib/pdf-font";
import {
  Trash2,
  Upload,
  ChevronDown,
  Eye,
  Save,
  AlertTriangle,
  Building2,
  User,
  FileText,
  List,
  Info,
} from "lucide-react";
import { calcTotals, InvoiceSchema, invoiceDisplayNo, migrateInvoice } from "@/lib/invoice";
import { getInvoice, saveInvoice } from "@/lib/library";
import { useGuestStore, type MetaTarget } from "@/lib/guest-store";
import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { getTemplate, canUseTemplate } from "@/components/invoice-templates/registry";
import { PaywallModal } from "@/components/editor/PaywallModal";
import { CustomSelect } from "@/components/ui/select";
import { Accordion } from "@/components/editor/Accordion";
import { AppShell, TopbarAction, topbarActionCls } from "@/components/AppShell";
import {
  DownloadIcon,
  PlusIcon,
  InvoiceIcon,
  CheckIcon,
} from "@/components/icons";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-2 text-sm text-[#141412] shadow-[inset_0_1px_2px_rgba(20,20,18,0.04)] outline-none transition placeholder:text-stone-400 focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/25";
export const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#3f3c37]";

type ViewMode = "both" | "form" | "preview";

const menuShellCls =
  "absolute top-full right-0 z-40 mt-2 w-60 animate-[menu-pop_.14s_ease-out] rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(20,20,18,0.45)] backdrop-blur";

const menuLabelCls =
  "px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400";

const menuItemCls =
  "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-xs font-semibold text-stone-700 transition hover:bg-[#0C6B4F]/5 hover:text-[#0C6B4F] disabled:cursor-not-allowed disabled:opacity-50";

const menuIconTileCls =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0C6B4F]/10 text-[#0C6B4F]";

const menuHintCls =
  "ml-auto rounded-md border border-[#E7E2D8] bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-stone-400";

function MenuShell({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div role="menu" className={cn(menuShellCls, wide && "w-72")}>
      <p className={menuLabelCls}>{label}</p>
      {children}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  hint,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={menuItemCls}
    >
      <span className={menuIconTileCls}>{icon}</span>
      <span>{label}</span>
      {hint ? <kbd className={menuHintCls}>{hint}</kbd> : null}
    </button>
  );
}

function GripHandle() {
  return (
    <span aria-hidden title="Drag (visual only)" className="flex cursor-grab flex-col gap-[3px] px-1 py-2 text-[#c9c3b6]">
      <span className="flex gap-[3px]"><i className="h-1 w-1 rounded-full bg-current" /><i className="h-1 w-1 rounded-full bg-current" /></span>
      <span className="flex gap-[3px]"><i className="h-1 w-1 rounded-full bg-current" /><i className="h-1 w-1 rounded-full bg-current" /></span>
      <span className="flex gap-[3px]"><i className="h-1 w-1 rounded-full bg-current" /><i className="h-1 w-1 rounded-full bg-current" /></span>
    </span>
  );
}

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
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 px-3 py-2 text-xs font-semibold text-stone-500 transition hover:border-[#0C6B4F]/60 hover:text-[#0C6B4F]"
        >
          <PlusIcon size={14} /> Add New Field
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
    rehydrate,
  } = useGuestStore();
  const [locked, setLocked] = useState<TemplateMeta | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedDefault, setSavedDefault] = useState(false);
  const [view, setView] = useState<ViewMode>("both");
  const [openSection, setOpenSection] = useState("company");
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pngBusy, setPngBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    rehydrate();
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const loadId = searchParams.get("load");
    if (!loadId) return;
    const snapshot = getInvoice(loadId);
    if (snapshot) {
      setInvoice({ ...migrateInvoice(snapshot.invoice) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  const validation = useMemo(() => InvoiceSchema.safeParse(invoice), [invoice]);
  const issues = validation.success ? [] : validation.error.issues;

  const template = getTemplate(invoice.templateId);
  const PdfDocument = template.PdfDocument;
  const Preview = template.Preview;

  const savedLabel =
    mounted && updatedAt
      ? new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--:--";

  const displayNo = invoiceDisplayNo({
    prefix: invoice.prefix ?? "",
    serialNumber: invoice.serialNumber ?? "",
    invoiceNo: invoice.invoiceNo,
  });

  const fmt = (n: number) => `${invoice.currency} ${n.toFixed(2)}`;

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const toggleSection = (id: string) =>
    setOpenSection((cur) => (cur === id ? "" : id));

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

  const handleSaveInvoice = () => {
    try {
      saveInvoice(invoice);
      showToast("Saved");
    } catch {
      showToast("Save failed");
    }
    setDownloadOpen(false);
  };

  const handleDownloadPng = async () => {
    const node = previewRef.current;
    if (!node) {
      showToast("Preview not ready");
      return;
    }
    setPngBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${invoice.prefix ?? ""}-${(invoice.serialNumber ?? "") || "invoice"}.png`;
      link.href = dataUrl;
      link.click();
      showToast("PNG downloaded");
    } catch {
      showToast("PNG export failed");
    } finally {
      setPngBusy(false);
      setDownloadOpen(false);
    }
  };

  const handleViewPdf = async () => {
    setPdfBusy(true);
    try {
      const blob = await pdf(
        <PdfDocument data={invoice} totals={totals} watermark={true} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      showToast("Could not open PDF");
    } finally {
      setPdfBusy(false);
      setDownloadOpen(false);
    }
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const raw =
        parsed && typeof parsed === "object" && "invoice" in parsed
          ? (parsed as { invoice: unknown }).invoice
          : parsed;
      const migrated = migrateInvoice(raw);
      setInvoice({ ...migrated });
      showToast("Imported");
    } catch {
      showToast("Import failed");
    }
  };

  const pdfDoc = mounted ? (
    <PdfDocument data={invoice} totals={totals} watermark={true} />
  ) : null;
  const fileName = `${displayNo || "invoice"}.pdf`;

  const actions = (
    <>
      <span className="hidden shrink-0 items-center gap-1.5 text-xs whitespace-nowrap text-stone-400 xl:inline-flex">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Saved {savedLabel}
      </span>

      <div className="relative shrink-0">
        <TopbarAction
          onClick={() => {
            setErrorsOpen((o) => !o);
            setDownloadOpen(false);
          }}
          aria-expanded={errorsOpen}
          aria-label={`Validation errors, ${issues.length} found`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Errors
          {issues.length > 0 ? (
            <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {issues.length}
            </span>
          ) : null}
        </TopbarAction>
        {errorsOpen ? (
          <MenuShell label="Validation" wide>
            {issues.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-stone-500">
                No issues — looks good.
              </p>
            ) : (
              <ul className="max-h-80 space-y-1 overflow-auto">
                {issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-xl bg-red-50/80 px-2 py-2 text-xs transition hover:bg-red-100">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono font-bold text-red-700">
                        {issue.path.join(".") || "invoice"}
                      </span>
                      <span className="text-stone-600">{issue.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </MenuShell>
        ) : null}
      </div>

      <TopbarAction onClick={() => fileRef.current?.click()}>
        <Upload className="h-3.5 w-3.5" /> Import
      </TopbarAction>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = "";
        }}
      />

      <div
        className="flex shrink-0 overflow-hidden rounded-lg border border-[#E7E2D8] text-xs font-semibold"
        role="group"
        aria-label="Editor view"
      >
        {(["both", "form", "preview"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setView(m)}
            aria-pressed={view === m}
            className={cn(
              "px-2.5 py-1.5 capitalize",
              view === m ? "bg-[#141412] text-white" : "bg-[#FFFDF8] text-stone-500",
            )}
          >
            {m === "both" ? "Both" : m === "form" ? "Form" : "Preview"}
          </button>
        ))}
      </div>

      <div className="relative flex shrink-0 items-center">
        {mounted && pdfDoc ? (
          <PDFDownloadLink
            document={pdfDoc}
            fileName={fileName}
            className="inline-flex items-center gap-1.5 rounded-l-lg bg-[#0C6B4F] px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#0a5a42]"
          >
            {({ loading }) => (
              <>
                <DownloadIcon size={14} />
                {loading ? "Preparing…" : "Download"}
              </>
            )}
          </PDFDownloadLink>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-l-lg bg-stone-300 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white">
            <DownloadIcon size={14} /> Download
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            setDownloadOpen((o) => !o);
            setErrorsOpen(false);
          }}
          aria-expanded={downloadOpen}
          aria-label="More download options"
          className="rounded-r-lg border-l border-white/25 bg-[#0C6B4F] px-1.5 py-1.5 text-white transition hover:bg-[#0a5a42]"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", downloadOpen && "rotate-180")} />
        </button>
        {downloadOpen ? (
          <MenuShell label="Export">
            <MenuItem
              icon={<Save className="h-3.5 w-3.5" />}
              label="Save Invoice"
              hint="LOCAL"
              onClick={handleSaveInvoice}
            />
            <MenuItem
              icon={<Eye className="h-3.5 w-3.5" />}
              label={pdfBusy ? "Opening…" : "View PDF"}
              hint="VIEW"
              onClick={() => void handleViewPdf()}
              disabled={pdfBusy}
            />
            {mounted && pdfDoc ? (
              <PDFDownloadLink
                document={pdfDoc}
                fileName={fileName}
                className={menuItemCls}
                onClick={() => setDownloadOpen(false)}
              >
                {({ loading }) => (
                  <>
                    <span className={menuIconTileCls}>
                      <DownloadIcon size={14} />
                    </span>
                    <span>{loading ? "Preparing…" : "Download PDF"}</span>
                    <kbd className={menuHintCls}>PDF</kbd>
                  </>
                )}
              </PDFDownloadLink>
            ) : null}
            <MenuItem
              icon={<ImageIcon className="h-3.5 w-3.5" />}
              label={pngBusy ? "Exporting…" : "Download PNG"}
              hint="PNG"
              onClick={() => void handleDownloadPng()}
              disabled={pngBusy}
            />
          </MenuShell>
        ) : null}
      </div>
    </>
  );

  return (
    <AppShell
      title="Create Invoice"
      icon={<InvoiceIcon size={20} />}
      actions={actions}
      backHref="/templates"
    >
      {(errorsOpen || downloadOpen) ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => {
            setErrorsOpen(false);
            setDownloadOpen(false);
          }}
          className="fixed inset-0 z-30 cursor-default bg-transparent"
        />
      ) : null}
      <div
        className={cn(
          "grid items-start gap-5 pb-24 lg:pb-0",
          view === "preview"
            ? "mx-auto w-full max-w-[860px]"
            : "lg:grid-cols-[400px_minmax(0,1fr)]",
        )}
      >
        {/* Left: form column */}
        <div className={cn("min-w-0 space-y-4", view === "preview" && "hidden")}>
          {/* Invoice Template selects row */}
          <section className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-4 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)] sm:p-5">
            <h2 className="text-sm font-bold text-stone-900">Invoice Template</h2>
            <p className="mb-3 text-xs text-stone-500">Design, color, mode &amp; font.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="template-select">Template</label>
                <CustomSelect
                  id="template-select"
                  label="Template"
                  value={invoice.templateId}
                  onChange={(next) => {
                    const meta = TEMPLATE_CATALOG.find((t) => t.id === next);
                    if (!meta) return;
                    setInvoice({ templateId: meta.id, accent: meta.accent });
                  }}
                  onLocked={(opt) => {
                    const meta = TEMPLATE_CATALOG.find((t) => t.id === opt.value);
                    if (meta) setLocked(meta);
                  }}
                  options={TEMPLATE_CATALOG.map((t) => ({
                    value: t.id,
                    label: t.isFree ? t.name : `${t.name} — PRO`,
                    locked: !canUseTemplate(false, t.id),
                  }))}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="font-select">Font</label>
                <CustomSelect
                  id="font-select"
                  label="Font"
                  value={invoice.theme?.font ?? "geist"}
                  onChange={(next) =>
                    setInvoice({
                      theme: {
                        ...(invoice.theme ?? { baseColor: "#0C6B4F", mode: "light" as const }),
                        font: next as "geist" | "inter" | "serif",
                      },
                    })
                  }
                  options={[
                    { value: "geist", label: "Geist" },
                    { value: "inter", label: "Inter" },
                    { value: "serif", label: "Serif" },
                  ]}
                />
              </div>
            </div>
          </section>

          <Accordion
            id="company"
            title="Company Details"
            subtitle="Your brand shown on the invoice"
            icon={<Building2 className="h-5 w-5" />}
            open={openSection === "company"}
            onToggle={() => toggleSection("company")}
          >
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
          </Accordion>

          <Accordion
            id="client"
            title="Client Details"
            subtitle="Who is this invoice for?"
            icon={<User className="h-5 w-5" />}
            open={openSection === "client"}
            onToggle={() => toggleSection("client")}
          >
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
          </Accordion>

          <Accordion
            id="invoice"
            title="Invoice Details"
            subtitle={`Number preview: ${displayNo || "INV-0001"}`}
            icon={<FileText className="h-5 w-5" />}
            open={openSection === "invoice"}
            onToggle={() => toggleSection("invoice")}
          >
            <div className="space-y-3">
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
                  <label className={labelCls} htmlFor="currency-select">Currency</label>
                  <CustomSelect
                    id="currency-select"
                    label="Currency"
                    value={invoice.currency}
                    onChange={(next) =>
                      setInvoice({ currency: next as typeof invoice.currency })
                    }
                    options={[
                      { value: "INR", label: "INR" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                    ]}
                  />
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
            </div>
          </Accordion>

          <Accordion
            id="items"
            title="Invoice Items"
            subtitle="Name + description per row"
            icon={<List className="h-5 w-5" />}
            open={openSection === "items"}
            onToggle={() => toggleSection("items")}
          >
            <div className="space-y-3">
              {invoice.items.map((it) => (
                <div key={it.id} className="group space-y-2 rounded-xl border border-[#E7E2D8] bg-white p-3 transition hover:border-[#0C6B4F]/40 hover:shadow-[0_8px_20px_-12px_rgba(12,107,79,0.4)]">
                  <div className="flex items-center gap-1">
                    <GripHandle />
                    <input
                      className={cn(inputCls, "font-semibold")}
                      value={it.name}
                      onChange={(e) => updateItem(it.id, { name: e.target.value })}
                      placeholder="Item name"
                      aria-label="Item name"
                    />
                  </div>
                  <textarea
                    className={inputCls}
                    rows={1}
                    value={it.description ?? ""}
                    onChange={(e) => updateItem(it.id, { description: e.target.value })}
                    placeholder="Description (optional)"
                    aria-label="Item description"
                  />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-stone-400 transition hover:bg-red-50 hover:text-red-600"
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
              <dl className="space-y-1 rounded-xl bg-stone-50 p-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <dt>Subtotal</dt><dd className="font-semibold">{fmt(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-stone-600">
                  <dt>Tax</dt><dd className="font-semibold">{fmt(totals.taxTotal)}</dd>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0C6B4F]">
                  <dt>Total</dt><dd>{fmt(totals.grandTotal)}</dd>
                </div>
              </dl>
            </div>
          </Accordion>

          <Accordion
            id="more"
            title="Additional Information"
            subtitle="Notes, terms & payment"
            icon={<Info className="h-5 w-5" />}
            open={openSection === "more"}
            onToggle={() => toggleSection("more")}
          >
            <div className="space-y-3">
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
            </div>
          </Accordion>
        </div>

        {/* Right: sticky live preview */}
        <div className={cn("min-w-0 lg:sticky lg:top-[76px]", view === "form" && "hidden")}>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-[#0C6B4F] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                <span className="h-2 w-2 rounded-full bg-red-500" />
              </span>
              Live
            </span>
            <span className="font-mono text-[11px] text-stone-500">{displayNo || "INV-0001"}</span>
          </div>
          <div
            ref={previewRef}
            id="invoice-preview"
            className="paper-texture overflow-auto rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-4 shadow-[0_30px_60px_-30px_rgba(20,20,18,0.45)] sm:p-6"
          >
            <Preview data={invoice} totals={totals} watermark={true} />
          </div>
          <dl className="mt-4 space-y-1.5 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-4 text-sm shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt><dd className="font-semibold">{fmt(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Discount</dt><dd className="font-semibold">− {fmt(totals.discount)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Tax</dt><dd className="font-semibold">{fmt(totals.taxTotal)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Adjustments</dt><dd className="font-semibold">{fmt(totals.adjustmentsTotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-[#E7E2D8] pt-2 text-base font-bold text-[#0C6B4F]">
              <dt>Grand total</dt><dd>{fmt(totals.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs text-stone-500">Saved {savedLabel}</span>
          {mounted && pdfDoc ? (
            <PDFDownloadLink
              document={pdfDoc}
              fileName={fileName}
              className={cn(topbarActionCls, "flex-1 justify-center !border-0 bg-[#0C6B4F] !py-3 text-sm !text-white hover:!text-white")}
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

      {toast ? (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#141412] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-xl lg:bottom-6"
        >
          {toast}
        </div>
      ) : null}

      <PaywallModal
        templateName={locked?.name ?? ""}
        open={locked !== null}
        onClose={() => setLocked(null)}
      />
    </AppShell>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading editor…</div>}>
      <EditorInner />
    </Suspense>
  );
}
