import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
  lineAmount,
  adjustmentAmount,
} from "./minimal-white";

const DISPLAY_SERIF = "Georgia, 'Times New Roman', serif";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function BoldDarkPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#A3E635");
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const bg = "#0d0d0f";
  const panel = "#161618";
  const line = "rgba(255,255,255,0.1)";
  return (
    <div
      className="relative mx-auto w-full max-w-[800px] overflow-hidden text-sm shadow-sm"
      style={{ backgroundColor: bg, color: "#fafafa", fontFamily }}
    >
      {/* Oversized ghost invoice number */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 left-0 w-full overflow-hidden text-center leading-none font-black whitespace-nowrap select-none"
        style={{ fontSize: 120, color: "rgba(255,255,255,0.04)", letterSpacing: "-0.02em" }}
      >
        {no}
      </div>

      <div className="relative p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-4 h-12 w-auto max-w-[180px] rounded-xl object-contain"
                style={{ backgroundColor: "#fafafa", padding: 6 }}
              />
            ) : null}
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Invoice
            </p>
            <h1
              className="mt-2 text-[40px] leading-none font-normal tracking-tight text-white"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {no}
            </h1>
            <p className="mt-4 font-semibold text-white">{data.fromName}</p>
            <p className="text-xs text-white/60">{data.fromEmail}</p>
            <p className="max-w-[300px] whitespace-pre-line text-xs text-white/60">
              {data.fromAddress}
            </p>
            {data.gstin ? (
              <p className="text-xs text-white/60">GSTIN: {data.gstin}</p>
            ) : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs text-white/60">
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
          {/* Lime total block, dark text */}
          <div
            className="rounded-2xl px-7 py-6 text-right"
            style={{ backgroundColor: accent }}
          >
            <p
              className="text-[11px] font-bold uppercase text-black/60"
              style={{ letterSpacing: "0.18em" }}
            >
              Total due
            </p>
            <p
              className="mt-1 text-[34px] leading-none font-black tracking-tight text-black tabular-nums"
              style={TABULAR}
            >
              {formatMoney(data.currency, totals.grandTotal)}
            </p>
            <p className="mt-2 text-xs font-medium text-black/70 tabular-nums" style={TABULAR}>
              Issued {data.issueDate} · Due {data.dueDate}
            </p>
            {data.paymentTerms ? (
              <p className="text-xs font-medium text-black/70">
                {data.paymentTerms}
              </p>
            ) : null}
          </div>
        </div>

        {/* Parties panel */}
        <div
          className="mt-8 grid grid-cols-2 gap-4 rounded-2xl p-5"
          style={{ backgroundColor: panel, border: `1px solid ${line}` }}
        >
          <div className="text-white/70">
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Billed by
            </p>
            <p className="mt-2 font-semibold text-white">{data.fromName}</p>
            <p className="text-xs">{data.fromEmail}</p>
          </div>
          <div className="text-right text-white/70">
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Billed to
            </p>
            <p className="mt-2 font-semibold text-white">{data.billToName}</p>
            <p className="text-xs">{data.billToEmail}</p>
            <p className="ml-auto max-w-[260px] whitespace-pre-line text-xs">
              {data.billToAddress}
            </p>
            {(data.clientMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs">
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
        </div>

        {/* Items — hairline white/10 separators, double accent rule */}
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] uppercase"
              style={{ borderBottom: `2px solid ${accent}`, color: accent }}
            >
              <th className="py-3 pr-2 font-bold" style={{ letterSpacing: "0.18em" }}>Description</th>
              <th className="w-16 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Qty</th>
              <th className="w-24 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Rate</th>
              <th className="w-16 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Tax%</th>
              <th className="w-24 py-3 text-right font-bold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr aria-hidden>
              <td colSpan={5} className="p-0">
                <div className="mt-[3px] h-px" style={{ backgroundColor: line }} />
              </td>
            </tr>
            {data.items.map((it) => (
              <tr
                key={it.id}
                className="border-b"
                style={{ borderColor: line }}
              >
                <td className="py-3 pr-2">
                  <p className="text-sm font-semibold text-white">{itemTitle(it)}</p>
                  {it.description ? (
                    <p className="mt-0.5 text-xs text-white/55">{it.description}</p>
                  ) : null}
                  {it.hsn ? (
                    <p className="mt-0.5 text-[11px] text-white/45">HSN: {it.hsn}</p>
                  ) : null}
                </td>
                <td className="py-3 text-right text-white/80 tabular-nums" style={TABULAR}>{it.qty}</td>
                <td className="py-3 text-right text-white/80 tabular-nums" style={TABULAR}>
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td className="py-3 text-right text-white/80 tabular-nums" style={TABULAR}>{it.taxPct}%</td>
                <td className="py-3 text-right font-semibold text-white tabular-nums" style={TABULAR}>
                  {formatMoney(data.currency, lineAmount(totals, it.id))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals — lime display total */}
        <div className="mt-8 flex">
          <div className="ml-auto w-72 space-y-1.5 text-[10pt] text-white/70 tabular-nums" style={TABULAR}>
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
            <div aria-hidden>
              <div className="h-[2px]" style={{ backgroundColor: accent }} />
              <div className="mt-[3px] h-px" style={{ backgroundColor: line }} />
            </div>
            <div
              className="flex items-baseline justify-between pt-1"
              style={{ color: accent }}
            >
              <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.18em" }}>
                Total
              </span>
              <span
                className="text-[34px] leading-none font-normal tracking-tight tabular-nums"
                style={{ fontFamily: DISPLAY_SERIF, ...TABULAR }}
              >
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-8 text-xs text-white/60">
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

        {data.notes || data.terms ? (
          <div className="mt-8 flex gap-6 text-xs text-white/55">
            <div className="w-1/2">
              {data.notes ? (
                <>
                  <p
                    className="text-[11px] font-bold uppercase"
                    style={{ color: accent, letterSpacing: "0.18em" }}
                  >
                    Notes
                  </p>
                  <p className="mt-1 text-xs whitespace-pre-line text-white/75">
                    {data.notes}
                  </p>
                </>
              ) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (
                <>
                  <p
                    className="text-[11px] font-bold uppercase"
                    style={{ color: accent, letterSpacing: "0.18em" }}
                  >
                    Terms
                  </p>
                  <p className="mt-1 text-xs whitespace-pre-line text-white/75">
                    {data.terms}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex justify-end">
          <div className="text-right">
            {data.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.signatureUrl}
                alt="Signature"
                className="ml-auto h-12 w-auto rounded object-contain"
                style={{ backgroundColor: "#fafafa", padding: 2 }}
              />
            ) : (
              <div
                className="ml-auto h-12 w-40 border-b"
                style={{ borderColor: line }}
                aria-hidden
              />
            )}
            <p className="mt-1 text-[8pt] text-white/50">
              Authorized signature
            </p>
          </div>
        </div>

        {watermark ? (
          <p className="mt-8 mb-2 text-center text-[8pt] text-white/35">
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
