import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
} from "./minimal-white";

const BURGUNDY = "#7F1D1D";
const SERIF = "Georgia, 'Times New Roman', serif";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function ConsultingRetainerPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, BURGUNDY);
  const dark = data.theme?.mode === "dark";
  const no = displayNo(data);
  const paper = dark ? "#100f0d" : "#ffffff";
  const ink = dark ? "#f0ece2" : "#1c1917";
  const body = dark ? "#c9c2b4" : "#57534e";
  const muted = dark ? "#8f887a" : "#78716c";
  const hairline = dark ? "#2b2a26" : "#e7e5e4";
  const cardBg = dark ? "#171512" : "#fafaf9";
  const tintBg = dark ? "#241314" : "#fbf1f1";
  const totalHours = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <div
      className="mx-auto w-full max-w-[800px] text-sm shadow-sm"
      style={{ backgroundColor: paper, color: ink, fontFamily: SERIF }}
    >
      <div style={{ backgroundColor: accent, height: 4 }} aria-hidden />
      <div className="px-8 pt-8 sm:px-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="Business logo" className="mb-4 h-11 w-auto max-w-[180px] object-contain" />
            ) : null}
            <p
              className="text-[11px] font-semibold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Retainer Statement
            </p>
            <h1 className="mt-2 text-[40px] leading-none font-normal tracking-tight">{no}</h1>
            <div className="mt-3 h-[2px] w-16" style={{ backgroundColor: accent }} aria-hidden />
            <p className="mt-4 font-semibold not-italic">{data.fromName}</p>
            <p className="whitespace-pre-line text-xs not-italic" style={{ color: body }}>
              {data.fromAddress}
            </p>
            <p className="text-xs not-italic" style={{ color: body }}>
              {data.fromEmail}
            </p>
            {data.gstin ? (
              <p className="text-xs not-italic" style={{ color: body }}>
                GSTIN: {data.gstin}
              </p>
            ) : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs not-italic" style={{ color: body }}>
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
          {/* Retainer summary card with hairline frame */}
          <div
            className="w-64 rounded-xl border p-5 not-italic"
            style={{ borderColor: hairline, backgroundColor: cardBg }}
          >
            <div className="h-[2px] w-10" style={{ backgroundColor: accent }} aria-hidden />
            <p
              className="mt-3 text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Retainer summary
            </p>
            <p className="mt-2 text-xs tabular-nums" style={{ color: body, ...TABULAR }}>
              Period
            </p>
            <p className="text-sm font-semibold tabular-nums" style={TABULAR}>
              {data.issueDate} → {data.dueDate}
            </p>
            <div
              className="mt-3 flex justify-between border-t pt-3 text-sm tabular-nums"
              style={{ borderColor: hairline, ...TABULAR }}
            >
              <span style={{ color: body }}>Total hours</span>
              <span className="font-bold">{totalHours} hrs</span>
            </div>
            <div className="mt-1 flex justify-between text-sm tabular-nums" style={TABULAR}>
              <span style={{ color: body }}>Amount</span>
              <span className="font-bold" style={{ color: accent }}>
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs not-italic" style={{ color: body }}>
          Prepared for{" "}
          <span className="font-semibold" style={{ color: ink }}>
            {data.billToName}
          </span>{" "}
          · {data.billToEmail} ·{" "}
          <span className="whitespace-pre-line">{data.billToAddress}</span>
        </p>
        {(data.clientMeta ?? []).map((m, i) => (
          <p key={i} className="text-xs not-italic" style={{ color: body }}>
            {m.label ? `${m.label}: ` : ""}
            {m.value}
          </p>
        ))}
        <div className="mt-6" aria-hidden>
          <div className="h-[2px]" style={{ backgroundColor: accent }} />
          <div className="mt-[3px] border-t" style={{ borderColor: hairline }} />
        </div>
      </div>

      <div className="px-8 py-6 sm:px-12">
        {/* Hours ledger table */}
        <table className="mt-2 w-full border-collapse text-left not-italic">
          <thead>
            <tr className="text-[11px] uppercase" style={{ color: muted }}>
              <th className="py-3 pr-2 font-semibold" style={{ letterSpacing: "0.18em", fontFamily: SERIF }}>
                Engagement
              </th>
              <th className="w-20 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>
                Hrs
              </th>
              <th className="w-28 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>
                Rate / hr
              </th>
              <th className="w-28 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr aria-hidden>
              <td colSpan={4} className="p-0">
                <div className="h-[2px]" style={{ backgroundColor: accent }} />
                <div className="mt-[3px] h-px" style={{ backgroundColor: hairline }} />
              </td>
            </tr>
            {data.items.map((it) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="py-3 pr-2">
                  <p className="font-semibold" style={{ fontFamily: SERIF }}>
                    {itemTitle(it)}
                  </p>
                  {it.description ? (
                    <p className="text-xs" style={{ color: muted }}>
                      {it.description}
                    </p>
                  ) : null}
                  {it.hsn ? (
                    <p className="text-[11px]" style={{ color: muted }}>
                      HSN: {it.hsn}
                    </p>
                  ) : null}
                  {it.taxPct ? (
                    <p className="text-[11px]" style={{ color: muted }}>
                      Tax {it.taxPct}%
                    </p>
                  ) : null}
                </td>
                <td className="py-3 text-right font-bold tabular-nums" style={TABULAR}>
                  {it.qty}
                </td>
                <td className="py-3 text-right tabular-nums" style={{ color: body, ...TABULAR }}>
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td className="py-3 text-right font-semibold tabular-nums" style={TABULAR}>
                  {formatMoney(data.currency, it.qty * it.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex gap-6 not-italic">
          <div className="flex-1">
            {/* paymentTerms in tinted highlight box */}
            {data.paymentTerms ? (
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: hairline, backgroundColor: tintBg }}
              >
                <div className="h-[2px] w-10" style={{ backgroundColor: accent }} aria-hidden />
                <p
                  className="mt-2 text-[11px] font-bold uppercase"
                  style={{ color: accent, letterSpacing: "0.18em" }}
                >
                  Payment terms
                </p>
                <p className="mt-1 text-sm font-semibold">{data.paymentTerms}</p>
              </div>
            ) : null}
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
            {data.notes || data.terms ? (
              <div className="mt-8 text-xs" style={{ color: muted }}>
                {data.notes ? (
                  <>
                    <p
                      className="text-[11px] font-bold uppercase"
                      style={{ color: accent, letterSpacing: "0.18em" }}
                    >
                      Notes
                    </p>
                    <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>
                      {data.notes}
                    </p>
                  </>
                ) : null}
                {data.terms ? (
                  <>
                    <p
                      className="mt-3 text-[11px] font-bold uppercase"
                      style={{ color: accent, letterSpacing: "0.18em" }}
                    >
                      Terms
                    </p>
                    <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>
                      {data.terms}
                    </p>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="w-60 space-y-1 text-[10pt] tabular-nums" style={{ color: body, ...TABULAR }}>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span style={{ fontFamily: SERIF }}>{formatMoney(data.currency, totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span style={{ fontFamily: SERIF }}>-{formatMoney(data.currency, totals.discount)}</span>
            </div>
            {(data.adjustments ?? []).map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>
                  {a.label || "Adjustment"}
                  {a.type === "percentage" ? ` (${a.value}%)` : ""}
                </span>
                <span style={{ fontFamily: SERIF }}>
                  {a.type === "percentage"
                    ? formatMoney(data.currency, (totals.subtotal * a.value) / 100)
                    : formatMoney(data.currency, a.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Tax</span>
              <span style={{ fontFamily: SERIF }}>{formatMoney(data.currency, totals.taxTotal)}</span>
            </div>
            {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between">
                <span>Adjustments</span>
                <span style={{ fontFamily: SERIF }}>
                  {formatMoney(data.currency, totals.adjustmentsTotal)}
                </span>
              </div>
            ) : null}
            <div aria-hidden>
              <div className="h-[2px]" style={{ backgroundColor: accent }} />
              <div className="mt-[3px] border-t" style={{ borderColor: hairline }} />
            </div>
            <div
              className="flex items-baseline justify-between pt-1"
              style={{ color: ink, fontFamily: SERIF }}
            >
              <span
                className="text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.18em", color: muted }}
              >
                Total
              </span>
              <span className="text-[26px] font-normal tracking-tight">
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end not-italic">
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
          <p className="mt-8 mb-2 text-center text-[8pt] not-italic" style={{ color: muted }}>
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
