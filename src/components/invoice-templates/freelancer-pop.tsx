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

export function FreelancerPopPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0C6B4F");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const cream = dark ? "#1c1917" : "#FFFBEB";
  const card = dark ? "#292524" : "#ffffff";
  const ink = dark ? "#f5f4f0" : "#1c1917";
  const meta = dark ? "#a8a29e" : "#78716c";
  const faint = dark ? "#a8a29e" : "#a8a29e";
  const hairline = dark ? "#44403c" : "#f5f0e1";
  return (
    <div
      className="mx-auto w-full max-w-[800px] p-4 text-sm sm:p-6"
      style={{ backgroundColor: cream, fontFamily, color: ink }}
    >
      {/* Emerald header block */}
      <div
        className="rounded-3xl p-8 shadow-lg sm:p-10"
        style={{ backgroundColor: accent, boxShadow: "0 20px 45px -20px rgba(0,0,0,0.35)" }}
      >
        <div className="flex items-start justify-between gap-6 text-white">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-4 h-10 w-auto max-w-[160px] rounded-xl bg-white/95 object-contain p-1.5 shadow-sm"
              />
            ) : null}
            <p
              className="text-[11px] font-bold uppercase text-white/70"
              style={{ letterSpacing: "0.18em" }}
            >
              Invoice
            </p>
            <h1
              className="mt-2 text-[38px] leading-none font-normal tracking-tight"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {no}
            </h1>
            <p className="mt-3 font-semibold text-white">{data.fromName} · {data.fromEmail}</p>
            <p className="max-w-[320px] whitespace-pre-line text-sm text-white/75">{data.fromAddress}</p>
            {(data.companyMeta ?? []).length > 0 && (
              <div className="mt-2 text-xs text-white/75">
                {(data.companyMeta ?? []).map((m, i) => (
                  <p key={i}>
                    {m.label ? `${m.label}: ` : ""}{m.value}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div
            className="rounded-full px-7 py-5 text-center shadow-md"
            style={{ backgroundColor: "#ffffff" }}
          >
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: faint, letterSpacing: "0.18em" }}
            >
              Total due
            </p>
            <p
              className="mt-1 text-[26px] leading-none font-bold tabular-nums"
              style={{ color: accent, ...TABULAR }}
            >
              {formatMoney(data.currency, totals.grandTotal)}
            </p>
            <p className="mt-1.5 text-xs" style={{ color: meta }}>
              Due {data.dueDate}
            </p>
          </div>
        </div>
      </div>

      {/* Cream body card */}
      <div
        className="mt-4 rounded-3xl p-8 shadow-md sm:p-10"
        style={{ backgroundColor: card, boxShadow: "0 12px 32px -18px rgba(0,0,0,0.25)" }}
      >
        <div className="flex flex-wrap justify-between gap-4" style={{ color: meta }}>
          <div>
            <p className="text-[11px] font-semibold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>
              Bill to
            </p>
            <p className="mt-2 text-[15px] font-semibold" style={{ color: ink }}>
              {data.billToName}
            </p>
            <p>{data.billToEmail}</p>
            <p className="max-w-[280px] whitespace-pre-line">{data.billToAddress}</p>
            {(data.clientMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs">
                {m.label ? `${m.label}: ` : ""}{m.value}
              </p>
            ))}
          </div>
          <div className="text-right tabular-nums" style={TABULAR}>
            <p className="text-[11px] font-semibold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>
              Details
            </p>
            <p className="mt-2">Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Payment: {data.paymentTerms}</p> : null}
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
          </div>
        </div>

        {/* Items — soft rows with double accent rule */}
        <div
          className="mt-8 overflow-hidden rounded-2xl border"
          style={{ borderColor: hairline }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase"
            style={{
              letterSpacing: "0.18em",
              color: faint,
              borderBottom: `2px solid ${accent}`,
            }}
          >
            <span>What you got</span>
            <span className="tabular-nums" style={TABULAR}>Amount</span>
          </div>
          <div className="h-[3px]" style={{ backgroundColor: hairline }} aria-hidden />
          {data.items.map((it, i) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5"
              style={{
                backgroundColor:
                  i % 2 === 0 ? (dark ? "#292524" : "#FFFBEB") : "transparent",
                borderBottom: `1px solid ${hairline}`,
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: ink }}>
                  {itemTitle(it)}
                </p>
                {it.description ? (
                  <p className="mt-0.5 text-xs" style={{ color: meta }}>
                    {it.description}
                  </p>
                ) : null}
                <p className="mt-0.5 text-xs tabular-nums" style={{ color: meta, ...TABULAR }}>
                  {it.qty} × {formatMoney(data.currency, it.rate)} · {it.taxPct}% tax
                  {it.hsn ? ` · HSN ${it.hsn}` : ""}
                </p>
              </div>
              <p className="font-bold tabular-nums" style={{ ...TABULAR }}>{formatMoney(data.currency, lineAmount(totals, it.id))}</p>
            </div>
          ))}
        </div>

        <p
          className="mt-6 text-center text-[15px]"
          style={{ fontFamily: DISPLAY_SERIF, fontStyle: "italic", color: accent }}
        >
          thanks a bunch for working with me!
        </p>

        <div className="mt-6 flex">
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
              className="inline-flex w-full items-baseline justify-between rounded-full px-5 py-2.5"
              style={{ backgroundColor: accent }}
            >
              <span className="text-[11px] font-bold uppercase text-white" style={{ letterSpacing: "0.18em" }}>
                Total
              </span>
              <span className="text-xl font-extrabold text-white tabular-nums" style={TABULAR}>
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-8 text-xs" style={{ color: meta }}>
            <p className="text-[11px] font-bold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>
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
                  <p className="text-[11px] font-bold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>Notes</p>
                  <p className="mt-1 text-xs whitespace-pre-line" style={{ color: meta }}>
                    {data.notes}
                  </p>
                </>
              ) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (
                <>
                  <p className="text-[11px] font-bold uppercase" style={{ color: faint, letterSpacing: "0.18em" }}>Terms</p>
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
          <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: faint }}>
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
