import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

export function PastelCreativePreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#F97066");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const bg = dark ? "#241a15" : "#FFF1E6";
  const card = dark ? "#33261f" : "#ffffff";
  const ink = dark ? "#fdeedf" : "#3f2d23";
  const muted = dark ? "#c9a68f" : "#9a7a65";
  return (
    <div
      className="mx-auto w-full max-w-[800px] p-6 text-sm sm:p-8"
      style={{ aspectRatio: "1 / 1.414", backgroundColor: bg, color: ink, fontFamily }}
    >
      {/* Header card: logo / invoice no / dates */}
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{ backgroundColor: card, boxShadow: "0 8px 30px rgba(249,112,102,0.12)" }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-3 h-12 w-auto max-w-[180px] rounded-2xl object-contain"
                style={{ backgroundColor: bg, padding: 6 }}
              />
            ) : (
              <div
                className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{ backgroundColor: accent }}
                aria-hidden
              >
                {data.fromName.charAt(0).toUpperCase()}
              </div>
            )}
            <p
              className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: accent }}
            >
              Invoice
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{no}</h1>
            <p className="mt-2 font-semibold">{data.fromName}</p>
            <p className="text-xs" style={{ color: muted }}>
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
          <div className="text-right text-xs" style={{ color: muted }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
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
              className="mt-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: bg }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                Amount due
              </p>
              <p className="text-2xl font-black" style={{ color: ink }}>
                {formatMoney(data.currency, totals.grandTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill-by / bill-to + meta lines */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: card }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
            Billed by
          </p>
          <p className="mt-1 font-semibold">{data.fromName}</p>
          <p className="text-xs" style={{ color: muted }}>
            {data.fromEmail}
          </p>
        </div>
        <div className="rounded-2xl p-5 text-right" style={{ backgroundColor: card }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>
            Billed to
          </p>
          <p className="mt-1 font-semibold">{data.billToName}</p>
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

      {/* Friendly rounded items table */}
      <div className="mt-4 overflow-hidden rounded-2xl" style={{ backgroundColor: card }}>
        <div
          className="grid grid-cols-[1fr_56px_88px_56px_88px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white"
          style={{ backgroundColor: accent }}
        >
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Tax%</span>
          <span className="text-right">Amount</span>
        </div>
        {data.items.map((it, i) => (
          <div
            key={it.id}
            className="grid grid-cols-[1fr_56px_88px_56px_88px] gap-2 px-5 py-3"
            style={{
              backgroundColor: i % 2 === 0 ? "transparent" : dark ? "#2b201a" : "#FFF8F1",
              borderTop: `1px dashed ${dark ? "#4a352a" : "#f5d9c8"}`,
            }}
          >
            <div>
              <p className="font-semibold">{itemTitle(it)}</p>
              {it.description ? (
                <p className="text-xs" style={{ color: muted }}>
                  {it.description}
                </p>
              ) : null}
              {it.hsn ? (
                <p className="rounded-full text-[11px]" style={{ color: muted }}>
                  HSN: {it.hsn}
                </p>
              ) : null}
            </div>
            <span className="text-right">{it.qty}</span>
            <span className="text-right">{formatMoney(data.currency, it.rate)}</span>
            <span className="text-right">{it.taxPct}%</span>
            <span className="text-right font-bold">{formatMoney(data.currency, it.qty * it.rate)}</span>
          </div>
        ))}
      </div>

      {/* Totals block right */}
      <div className="mt-4 flex">
        <div
          className="ml-auto w-64 space-y-1.5 rounded-2xl p-5 text-[10pt]"
          style={{ backgroundColor: card, color: muted }}
        >
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span style={{ color: ink }}>{formatMoney(data.currency, totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span style={{ color: ink }}>-{formatMoney(data.currency, totals.discount)}</span>
          </div>
          {(data.adjustments ?? []).map((a) => (
            <div key={a.id} className="flex justify-between text-xs">
              <span>
                {a.label || "Adjustment"}
                {a.type === "percentage" ? ` (${a.value}%)` : ""}
              </span>
              <span style={{ color: ink }}>
                {a.type === "percentage"
                  ? formatMoney(data.currency, (totals.subtotal * a.value) / 100)
                  : formatMoney(data.currency, a.value)}
              </span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Tax</span>
            <span style={{ color: ink }}>{formatMoney(data.currency, totals.taxTotal)}</span>
          </div>
          {totals.adjustmentsTotal !== 0 ? (
            <div className="flex justify-between">
              <span>Adjustments</span>
              <span style={{ color: ink }}>{formatMoney(data.currency, totals.adjustmentsTotal)}</span>
            </div>
          ) : null}
          <div className="border-t-2 border-dashed pt-2" style={{ borderColor: accent }} aria-hidden />
          <div className="flex justify-between text-lg font-black" style={{ color: ink }}>
            <span>Total</span>
            <span>{formatMoney(data.currency, totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {(data.paymentInfo ?? []).length > 0 ? (
        <div className="mt-4 rounded-2xl p-5 text-xs" style={{ backgroundColor: card, color: muted }}>
          <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>
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
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs" style={{ color: muted }}>
          <div className="rounded-2xl p-5" style={{ backgroundColor: card }}>
            {data.notes ? (
              <>
                <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>
                  Notes
                </p>
                <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: ink }}>
                  {data.notes}
                </p>
              </>
            ) : null}
          </div>
          <div className="rounded-2xl p-5" style={{ backgroundColor: card }}>
            {data.terms ? (
              <>
                <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>
                  Terms
                </p>
                <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: ink }}>
                  {data.terms}
                </p>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <div className="text-right">
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.signatureUrl}
              alt="Signature"
              className="ml-auto h-12 w-auto rounded-2xl object-contain"
              style={{ backgroundColor: card, padding: 4 }}
            />
          ) : (
            <div className="ml-auto h-12 w-40 border-b-2 border-dashed" style={{ borderColor: accent }} aria-hidden />
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
