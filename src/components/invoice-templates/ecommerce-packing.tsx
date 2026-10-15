import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

const KRAFT = "#92400E";
const DISPLAY_SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function EcommercePackingPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, KRAFT);
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const paper = dark ? "#0a141f" : "#FBF7F1";
  const cardBg = dark ? "#101f30" : "#ffffff";
  const ink = dark ? "#eef4fa" : "#1c1917";
  const body = dark ? "#b9c7d8" : "#57534e";
  const muted = dark ? "#7d93ab" : "#78716c";
  const hairline = dark ? "#1d2f44" : "#e7e0d5";
  const totalQty = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <div
      className="mx-auto w-full max-w-[800px] text-sm shadow-sm"
      style={{ backgroundColor: paper, color: ink, fontFamily }}
    >
      {/* Dashed cut-line motif */}
      <div className="px-8 pt-5 sm:px-10" aria-hidden>
        <div className="relative border-t border-dashed" style={{ borderColor: muted }}>
          <span
            className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 text-[10px]"
            style={{ backgroundColor: paper, color: muted, fontFamily: MONO }}
          >
            ✂ cut here
          </span>
        </div>
      </div>

      {/* Slip head — eyebrow, serif number, tabular schedule */}
      <div className="px-8 pt-5 sm:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Packing Slip
            </p>
            <h1
              className="mt-2 text-[38px] leading-none font-normal tracking-tight"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {no}
            </h1>
            <p className="mt-2 text-xs" style={{ color: muted, fontFamily: MONO }}>
              Order: {no}
            </p>
          </div>
          <div className="text-right text-xs leading-relaxed tabular-nums" style={{ color: body, ...TABULAR }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Schedule
            </p>
            <p className="mt-2" style={{ color: ink }}>
              Issued: {data.issueDate}
            </p>
            <p style={{ color: ink }}>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
            <span
              className="mt-2 inline-block rounded border px-2 py-0.5 text-[11px]"
              style={{ borderColor: hairline, fontFamily: MONO, color: body }}
            >
              {totalQty} items · {data.items.length} lines
            </span>
          </div>
        </div>
      </div>

      {/* Barcode stripe from thin divs */}
      <div className="flex h-8 items-stretch gap-[3px] px-8 pt-4 sm:px-10" aria-hidden>
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 7 === 0 ? 4 : i % 3 === 0 ? 2.5 : 1.25,
              backgroundColor: i % 11 === 0 ? accent : dark ? "#334155" : "#1c1917",
              opacity: i % 11 === 0 ? 0.85 : 0.8,
            }}
          />
        ))}
      </div>
      <div className="px-8 sm:px-10" aria-hidden>
        <div className="h-[2px]" style={{ backgroundColor: accent }} />
        <div className="mt-[3px] h-px" style={{ backgroundColor: hairline }} />
      </div>

      <div className="px-8 py-6 sm:px-10">
        {/* Ship-to box with hairline frame */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Ship to
            </p>
            <p className="mt-2 text-[15px] font-semibold">{data.billToName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>
              {data.billToAddress}
            </p>
            <p className="text-xs" style={{ color: body }}>
              {data.billToEmail}
            </p>
            {(data.clientMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs" style={{ color: body }}>
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Bill to
            </p>
            <p className="mt-2 text-[15px] font-semibold">{data.billToName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>
              {data.billToAddress}
            </p>
            <p className="mt-2 text-xs font-semibold" style={{ color: ink }}>
              {data.fromName}
            </p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>
              {data.fromAddress}
            </p>
            {data.gstin ? (
              <p className="text-xs" style={{ color: body }}>
                GSTIN: {data.gstin}
              </p>
            ) : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs" style={{ color: body }}>
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
        </div>

        {/* Ledger table — eyebrow header, mono SKU chips, serif tabular numerals */}
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="text-[11px] uppercase" style={{ color: muted }}>
              <th className="py-3 pr-2 font-bold" style={{ letterSpacing: "0.18em" }}>SKU</th>
              <th className="py-3 pr-2 font-bold" style={{ letterSpacing: "0.18em" }}>Item</th>
              <th className="w-16 py-3 text-center font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Qty</th>
              <th className="w-24 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Rate</th>
              <th className="w-24 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr aria-hidden>
              <td colSpan={5} className="p-0">
                <div className="h-[2px]" style={{ backgroundColor: accent }} />
                <div className="mt-[3px] h-px" style={{ backgroundColor: hairline }} />
              </td>
            </tr>
            {data.items.map((it, idx) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="py-3 pr-2">
                  <span
                    className="inline-block rounded border px-1.5 py-0.5 text-[11px]"
                    style={{ borderColor: hairline, fontFamily: MONO, color: accent }}
                  >
                    {it.hsn || `SKU-${String(idx + 1).padStart(3, "0")}`}
                  </span>
                </td>
                <td className="py-3 pr-2">
                  <p className="text-sm font-semibold" style={{ color: ink }}>
                    {itemTitle(it)}
                  </p>
                  {it.description ? (
                    <p className="mt-0.5 text-xs" style={{ color: muted }}>
                      {it.description}
                    </p>
                  ) : null}
                </td>
                <td
                  className="py-3 text-center tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, ...TABULAR }}
                >
                  {it.qty}
                </td>
                <td
                  className="py-3 text-right tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, color: body, ...TABULAR }}
                >
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td
                  className="py-3 text-right font-semibold tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, color: ink, ...TABULAR }}
                >
                  {formatMoney(data.currency, it.qty * it.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex gap-6">
          <div
            className="flex-1 rounded-lg border border-dashed p-4 text-center"
            style={{ borderColor: accent, backgroundColor: cardBg }}
          >
            <p className="text-sm font-semibold" style={{ color: ink }}>
              Thank you for shopping with {data.fromName}!
            </p>
            {data.notes ? (
              <p className="mt-1 whitespace-pre-line text-xs" style={{ color: body }}>
                {data.notes}
              </p>
            ) : null}
            {data.terms ? (
              <p className="mt-1 whitespace-pre-line text-xs" style={{ color: muted }}>
                {data.terms}
              </p>
            ) : null}
          </div>
          {/* Compact refined totals */}
          <div
            className="w-60 space-y-1 text-[10pt] tabular-nums"
            style={{ color: body, ...TABULAR }}
          >
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span style={{ fontFamily: DISPLAY_SERIF }}>
                {formatMoney(data.currency, totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span style={{ fontFamily: DISPLAY_SERIF }}>
                -{formatMoney(data.currency, totals.discount)}
              </span>
            </div>
            {(data.adjustments ?? []).map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>
                  {a.label || "Adjustment"}
                  {a.type === "percentage" ? ` (${a.value}%)` : ""}
                </span>
                <span style={{ fontFamily: DISPLAY_SERIF }}>
                  {a.type === "percentage"
                    ? formatMoney(data.currency, (totals.subtotal * a.value) / 100)
                    : formatMoney(data.currency, a.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Tax</span>
              <span style={{ fontFamily: DISPLAY_SERIF }}>
                {formatMoney(data.currency, totals.taxTotal)}
              </span>
            </div>
            {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between">
                <span>Adjustments</span>
                <span style={{ fontFamily: DISPLAY_SERIF }}>
                  {formatMoney(data.currency, totals.adjustmentsTotal)}
                </span>
              </div>
            ) : null}
            <div aria-hidden>
              <div className="h-[2px]" style={{ backgroundColor: accent }} />
              <div className="mt-[3px] border-t" style={{ borderColor: hairline }} />
            </div>
            <div className="flex items-baseline justify-between pt-1" style={{ color: ink }}>
              <span
                className="text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.18em", color: muted }}
              >
                Total
              </span>
              <span
                style={{ fontFamily: DISPLAY_SERIF }}
                className="text-[26px] font-normal tracking-tight"
              >
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-8 text-xs" style={{ color: body }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Payment info
            </p>
            {(data.paymentInfo ?? []).map((m, i) => (
              <p key={i} className="mt-0.5 text-[8pt]">
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex justify-end">
          <div className="text-right">
            {data.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.signatureUrl}
                alt="Signature"
                className="ml-auto h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="ml-auto h-12 w-40 border-b"
                style={{ borderColor: muted }}
                aria-hidden
              />
            )}
            <p className="mt-1 text-[8pt]" style={{ color: muted }}>
              Authorized signature
            </p>
          </div>
        </div>

        {watermark ? (
          <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: muted }}>
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
