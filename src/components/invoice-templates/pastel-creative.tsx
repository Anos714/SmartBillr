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

const TERRA = "#C2410C";
const DISPLAY_SERIF = "Georgia, 'Times New Roman', serif";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function PastelCreativePreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, TERRA);
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const bg = dark ? "#241a15" : "#FFF1E6";
  const card = dark ? "#33261f" : "#ffffff";
  const ink = dark ? "#fdeedf" : "#3f2d23";
  const muted = dark ? "#c9a68f" : "#9a7a65";
  const soft = dark ? "#d8bfa9" : "#7c5a44";
  const hairline = dark ? "#4a352a" : "#f0d9c6";
  return (
    <div
      className="mx-auto w-full max-w-[800px] p-8 text-sm shadow-sm sm:p-10"
      style={{ backgroundColor: bg, color: ink, fontFamily }}
    >
      {/* Header card: logo / invoice no / dates */}
      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{ backgroundColor: card, borderColor: hairline }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-4 h-12 w-auto max-w-[180px] rounded-2xl object-contain"
                style={{ backgroundColor: bg, padding: 6 }}
              />
            ) : (
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{ backgroundColor: accent, fontFamily: DISPLAY_SERIF }}
                aria-hidden
              >
                {data.fromName.charAt(0).toUpperCase()}
              </div>
            )}
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Invoice
            </p>
            <h1
              className="mt-2 text-[38px] leading-none font-normal tracking-tight"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {no}
            </h1>
            <p className="mt-3 text-[15px] font-semibold">{data.fromName}</p>
            <p className="mt-0.5 text-xs" style={{ color: muted }}>
              {data.fromEmail}
            </p>
            <p className="max-w-[300px] whitespace-pre-line text-xs" style={{ color: muted }}>
              {data.fromAddress}
            </p>
            {data.gstin ? (
              <p className="text-xs" style={{ color: muted }}>
                GSTIN: {data.gstin}
              </p>
            ) : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs" style={{ color: muted }}>
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
          <div className="text-right text-xs tabular-nums" style={{ color: muted, ...TABULAR }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: accent, letterSpacing: "0.18em" }}
            >
              Studio schedule
            </p>
            <p className="mt-2 font-semibold" style={{ color: ink }}>
              Issued: {data.issueDate}
            </p>
            <p className="font-semibold" style={{ color: ink }}>
              Due: {data.dueDate}
            </p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
            <div
              className="mt-4 rounded-2xl border px-4 py-3"
              style={{ backgroundColor: bg, borderColor: hairline }}
            >
              <p
                className="text-[11px] font-bold uppercase"
                style={{ color: accent, letterSpacing: "0.18em" }}
              >
                Amount due
              </p>
              <p
                className="mt-1 text-[26px] leading-none font-normal tracking-tight tabular-nums"
                style={{ color: ink, fontFamily: DISPLAY_SERIF, ...TABULAR }}
              >
                {formatMoney(data.currency, totals.grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill-by / bill-to + meta lines */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="rounded-2xl border p-5" style={{ backgroundColor: card, borderColor: hairline }}>
          <p
            className="text-[11px] font-bold uppercase"
            style={{ color: accent, letterSpacing: "0.18em" }}
          >
            Billed by
          </p>
          <p className="mt-2 text-[15px] font-semibold">{data.fromName}</p>
          <p className="text-xs" style={{ color: muted }}>
            {data.fromEmail}
          </p>
        </div>
        <div
          className="rounded-2xl border p-5 text-right"
          style={{ backgroundColor: card, borderColor: hairline }}
        >
          <p
            className="text-[11px] font-bold uppercase"
            style={{ color: accent, letterSpacing: "0.18em" }}
          >
            Billed to
          </p>
          <p className="mt-2 text-[15px] font-semibold">{data.billToName}</p>
          <p className="text-xs" style={{ color: muted }}>
            {data.billToEmail}
          </p>
          <p className="ml-auto max-w-[260px] whitespace-pre-line text-xs" style={{ color: muted }}>
            {data.billToAddress}
          </p>
          {(data.clientMeta ?? []).map((m, i) => (
            <p key={i} className="text-xs" style={{ color: muted }}>
              {m.label ? `${m.label}: ` : ""}
              {m.value}
            </p>
          ))}
        </div>
      </div>

      {/* Items card — letterspaced header, hairline rows, serif tabular numerals */}
      <div
        className="mt-8 overflow-hidden rounded-2xl border"
        style={{ backgroundColor: card, borderColor: hairline }}
      >
        <div
          className="grid grid-cols-[1fr_56px_88px_56px_88px] gap-2 px-5 py-3 text-[11px] font-bold uppercase text-white"
          style={{
            backgroundColor: accent,
            letterSpacing: "0.18em",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 7px)",
          }}
        >
          <span>Description</span>
          <span className="text-right tabular-nums">Qty</span>
          <span className="text-right tabular-nums">Rate</span>
          <span className="text-right tabular-nums">Tax%</span>
          <span className="text-right tabular-nums">Amount</span>
        </div>
        <div className="h-[2px]" style={{ backgroundColor: accent }} aria-hidden />
        <div className="h-px" style={{ backgroundColor: hairline }} aria-hidden />
        {data.items.map((it) => (
          <div
            key={it.id}
            className="grid grid-cols-[1fr_56px_88px_56px_88px] gap-2 border-b px-5 py-3"
            style={{ borderColor: hairline }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: ink }}>
                {itemTitle(it)}
              </p>
              {it.description ? (
                <p className="mt-0.5 text-xs" style={{ color: muted }}>
                  {it.description}
                </p>
              ) : null}
              {it.hsn ? (
                <p className="mt-0.5 text-[11px]" style={{ color: muted }}>
                  HSN: {it.hsn}
                </p>
              ) : null}
            </div>
            <span className="text-right tabular-nums" style={{ fontFamily: DISPLAY_SERIF, ...TABULAR }}>
              {it.qty}
            </span>
            <span className="text-right tabular-nums" style={{ fontFamily: DISPLAY_SERIF, color: soft, ...TABULAR }}>
              {formatMoney(data.currency, it.rate)}
            </span>
            <span className="text-right tabular-nums" style={{ fontFamily: DISPLAY_SERIF, color: soft, ...TABULAR }}>
              {it.taxPct}%
            </span>
            <span
              className="text-right font-semibold tabular-nums"
              style={{ fontFamily: DISPLAY_SERIF, color: ink, ...TABULAR }}
            >
              {formatMoney(data.currency, lineAmount(totals, it.id))}
            </span>
          </div>
        ))}
      </div>

      {/* Totals block right — serif numerals, double rule */}
      <div className="mt-8 flex">
        <div
          className="ml-auto w-64 space-y-1.5 rounded-2xl border p-5 text-[10pt] tabular-nums"
          style={{ backgroundColor: card, borderColor: hairline, color: soft, ...TABULAR }}
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
                {formatMoney(data.currency, adjustmentAmount(totals, a.id))}
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
        <div
          className="mt-8 rounded-2xl border p-5 text-xs"
          style={{ backgroundColor: card, borderColor: hairline, color: soft }}
        >
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
        <div className="mt-8 grid grid-cols-2 gap-6 text-xs" style={{ color: muted }}>
          <div className="rounded-2xl border p-5" style={{ backgroundColor: card, borderColor: hairline }}>
            {data.notes ? (
              <>
                <p
                  className="text-[11px] font-bold uppercase"
                  style={{ color: accent, letterSpacing: "0.18em" }}
                >
                  Notes
                </p>
                <p className="mt-1 text-xs whitespace-pre-line" style={{ color: soft }}>
                  {data.notes}
                </p>
              </>
            ) : null}
          </div>
          <div className="rounded-2xl border p-5" style={{ backgroundColor: card, borderColor: hairline }}>
            {data.terms ? (
              <>
                <p
                  className="text-[11px] font-bold uppercase"
                  style={{ color: accent, letterSpacing: "0.18em" }}
                >
                  Terms
                </p>
                <p className="mt-1 text-xs whitespace-pre-line" style={{ color: soft }}>
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
              className="ml-auto h-12 w-auto object-contain"
            />
          ) : (
            <div
              className="ml-auto h-12 w-40 border-b"
              style={{ borderColor: hairline }}
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
  );
}
