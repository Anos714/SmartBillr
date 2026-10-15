import type { InvoiceData, InvoiceTotals } from "@/lib/invoice";
import { invoiceDisplayNo } from "@/lib/invoice";
import { formatMoney as canonicalFormatMoney } from "@/lib/money";

export type TemplateProps = {
  data: InvoiceData;
  totals: InvoiceTotals;
  watermark?: boolean;
};

/**
 * Template-local formatter (legacy arg order). Delegates to the canonical
 * "@/lib/money" formatter so previews and PDFs share one code path:
 * en-IN grouping for INR (₹), en-US otherwise.
 */
export function formatMoney(currency: string, value: number): string {
  return canonicalFormatMoney(value, currency);
}

/** Pre-computed per-line amount (qty*rate, Decimal-rounded). Use in render — no inline math. */
export function lineAmount(totals: InvoiceTotals, id: string): number {
  return totals.lines.find((l) => l.id === id)?.amount ?? 0;
}

/** Pre-computed per-adjustment amount (percentage resolved on subtotal). Use in render. */
export function adjustmentAmount(totals: InvoiceTotals, id: string): number {
  return totals.adjustmentsDetailed.find((d) => d.id === id)?.amount ?? 0;
}


export function resolveAccent(data: InvoiceData, fallback: string): string {
  return data.theme?.baseColor || data.accent || fallback;
}

export function displayNo(data: InvoiceData): string {
  return invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
}

export function itemTitle(it: { name?: string; desc?: string }): string {
  if (it.name && it.name.trim()) return it.name;
  if (it.desc && it.desc.trim()) return it.desc;
  return "Untitled item";
}

export function themeFontFamily(font: string | undefined): string {
  if (font === "serif") return "Georgia, 'Times New Roman', serif";
  if (font === "inter") return "Inter, system-ui, sans-serif";
  return "Geist, system-ui, -apple-system, sans-serif";
}

const DISPLAY_SERIF = "Georgia, 'Times New Roman', serif";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function MinimalWhitePreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0C6B4F");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const bg = dark ? "#1a1a18" : "#ffffff";
  const ink = dark ? "#f5f4f0" : "#18181b";
  const meta = dark ? "#a8a29e" : "#71717a";
  const faint = dark ? "#a8a29e" : "#a1a1aa";
  const hairline = dark ? "#292524" : "#f4f4f5";
  const whisper = dark ? "#292524" : "#f4f4f5";
  return (
    <div
      className="mx-auto w-full max-w-[800px] p-8 text-sm shadow-sm sm:p-12"
      style={{ backgroundColor: bg, color: ink, fontFamily }}
    >
      {/* Masthead — gallery restraint */}
      <div className="flex items-start justify-between gap-6">
        <div>
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logoUrl}
              alt="Business logo"
              className="mb-5 h-12 w-auto max-w-[180px] object-contain"
            />
          ) : null}
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: faint, letterSpacing: "0.18em" }}
          >
            Invoice
          </p>
          <h1
            className="mt-2 text-[40px] leading-none font-normal tracking-tight"
            style={{ fontFamily: DISPLAY_SERIF, color: ink }}
          >
            {no}
          </h1>
          <div
            className="mt-2 h-[2px] w-16"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <div className="mt-6 space-y-1" style={{ color: meta }}>
            <p className="font-semibold" style={{ color: ink }}>
              {data.fromName}
            </p>
            <p>{data.fromEmail}</p>
            <p className="max-w-[280px] whitespace-pre-line">{data.fromAddress}</p>
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i}>
                {m.label ? `${m.label}: ` : ""}{m.value}
              </p>
            ))}
          </div>
        </div>
        <div style={{ color: meta }} className="pt-1 text-right">
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: faint, letterSpacing: "0.18em" }}
          >
            Bill to
          </p>
          <p className="mt-2 text-[15px] font-semibold" style={{ color: ink }}>
            {data.billToName}
          </p>
          <p>{data.billToEmail}</p>
          <p className="ml-auto max-w-[240px] whitespace-pre-line">{data.billToAddress}</p>
          {(data.clientMeta ?? []).map((m, i) => (
            <p key={i}>
              {m.label ? `${m.label}: ` : ""}{m.value}
            </p>
          ))}
          <div className="mt-6 space-y-0.5 tabular-nums" style={TABULAR}>
            <p>Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
          </div>
        </div>
      </div>

      {/* Items — whisper-light separators, double rule under header */}
      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr
            className="text-[11px] uppercase"
            style={{ borderBottom: `2px solid ${accent}`, color: meta }}
          >
            <th
              className="py-3 pr-2 font-semibold"
              style={{
                letterSpacing: "0.18em",
                boxShadow: `0 3px 0 ${bg}, 0 4px 0 ${hairline}`,
              }}
            >
              Description
            </th>
            <th
              className="w-16 py-3 text-right font-semibold tabular-nums"
              style={{
                letterSpacing: "0.18em",
                boxShadow: `0 3px 0 ${bg}, 0 4px 0 ${hairline}`,
                ...TABULAR,
              }}
            >
              Qty
            </th>
            <th
              className="w-24 py-3 text-right font-semibold tabular-nums"
              style={{
                letterSpacing: "0.18em",
                boxShadow: `0 3px 0 ${bg}, 0 4px 0 ${hairline}`,
                ...TABULAR,
              }}
            >
              Rate
            </th>
            <th
              className="w-16 py-3 text-right font-semibold tabular-nums"
              style={{
                letterSpacing: "0.18em",
                boxShadow: `0 3px 0 ${bg}, 0 4px 0 ${hairline}`,
                ...TABULAR,
              }}
            >
              Tax%
            </th>
            <th
              className="w-24 py-3 text-right font-semibold tabular-nums"
              style={{
                letterSpacing: "0.18em",
                boxShadow: `0 3px 0 ${bg}, 0 4px 0 ${hairline}`,
                ...TABULAR,
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr
              key={it.id}
              className="border-b"
              style={{ borderColor: whisper }}
            >
              <td className="py-3 pr-2">
                <p className="text-sm font-semibold">{itemTitle(it)}</p>
                {it.description ? (
                  <p className="mt-0.5 text-xs" style={{ color: meta }}>
                    {it.description}
                  </p>
                ) : null}
                {it.hsn ? (
                  <p className="mt-0.5 text-[11px]" style={{ color: meta }}>
                    HSN: {it.hsn}
                  </p>
                ) : null}
              </td>
              <td className="py-3 text-right tabular-nums" style={TABULAR}>{it.qty}</td>
              <td className="py-3 text-right tabular-nums" style={TABULAR}>{formatMoney(data.currency, it.rate)}</td>
              <td className="py-3 text-right tabular-nums" style={TABULAR}>{it.taxPct}%</td>
              <td className="py-3 text-right font-medium tabular-nums" style={TABULAR}>
                {formatMoney(data.currency, lineAmount(totals, it.id))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals — right aligned, hairline divider */}
      <div className="mt-8 flex">
        <div className="ml-auto w-64 space-y-1.5 text-[10pt] tabular-nums" style={{ color: meta, ...TABULAR }}>
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatMoney(data.currency, totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatMoney(data.currency, totals.discount)}</span>
          </div>
          {(data.adjustments ?? []).map((a) => (
            <div key={a.id} className="flex justify-between text-xs">
              <span>
                {a.label || "Adjustment"}
                {a.type === "percentage" ? ` (${a.value}%)` : ""}
              </span>
              <span>
                {formatMoney(data.currency, adjustmentAmount(totals, a.id))}
              </span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatMoney(data.currency, totals.taxTotal)}</span>
          </div>
          {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
            <div className="flex justify-between">
              <span>Adjustments</span>
              <span>{formatMoney(data.currency, totals.adjustmentsTotal)}</span>
            </div>
          ) : null}
          <div className="border-t pt-3" style={{ borderColor: hairline }} aria-hidden />
          <div
            className="flex items-baseline justify-between"
            style={{ color: ink }}
          >
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ letterSpacing: "0.18em", color: faint }}
            >
              Total
            </span>
            <span
              className="text-[28px] font-normal tracking-tight"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {formatMoney(data.currency, totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {(data.paymentInfo ?? []).length > 0 ? (
        <div className="mt-8 text-xs" style={{ color: meta }}>
          <p className="text-[11px] font-semibold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>
            Payment info
          </p>
          {(data.paymentInfo ?? []).map((m, i) => (
            <p key={i} className="mt-0.5 text-[8pt]">
              {m.label ? `${m.label}: ` : ""}{m.value}
            </p>
          ))}
        </div>
      ) : null}

      {(data.notes || data.terms) && (
        <div className="mt-8 flex gap-6 text-xs" style={{ color: meta }}>
          <div className="w-1/2">
            {data.notes ? (
              <>
                <p className="text-[11px] font-semibold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>Notes</p>
                <p className="mt-1 text-xs whitespace-pre-line" style={{ color: meta }}>
                  {data.notes}
                </p>
              </>
            ) : null}
          </div>
          <div className="w-1/2">
            {data.terms ? (
              <>
                <p className="text-[11px] font-semibold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>Terms</p>
                <p className="mt-1 text-xs whitespace-pre-line" style={{ color: meta }}>
                  {data.terms}
                </p>
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <div className="text-right">
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.signatureUrl} alt="Signature" className="ml-auto h-12 w-auto object-contain" />
          ) : (
            <div className="ml-auto h-12 w-40 border-b" style={{ borderColor: hairline }} aria-hidden />
          )}
          <p className="mt-1 text-[8pt]" style={{ color: meta }}>
            Authorized signature
          </p>
        </div>
      </div>

      {watermark ? (
        <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: dark ? "#78716c" : "#a1a1aa" }}>
          Made with SmartBillr
        </p>
      ) : null}
    </div>
  );
}
