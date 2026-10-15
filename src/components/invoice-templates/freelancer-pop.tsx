import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

export function FreelancerPopPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0C6B4F");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden rounded-xl text-sm shadow-sm"
      style={{
        aspectRatio: "1 / 1.414",
        backgroundColor: dark ? "#1c1917" : "#ffffff",
        color: dark ? "#f5f4f0" : "#18181b",
        fontFamily,
      }}
    >
      <div className="p-8 sm:p-10" style={{ backgroundColor: accent }}>
        <div className="flex items-start justify-between gap-6 text-white">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-3 h-10 w-auto max-w-[160px] rounded-md bg-white/90 object-contain p-1"
              />
            ) : null}
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Invoice
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">{no}</h1>
            <p className="mt-2 text-white/85">{data.fromName} · {data.fromEmail}</p>
            <p className="max-w-[320px] whitespace-pre-line text-white/75">{data.fromAddress}</p>
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
            className="rounded-xl px-5 py-4 text-right shadow"
            style={{ backgroundColor: dark ? "#292524" : "#ffffff" }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: dark ? "#d6d3d1" : "#a1a1aa" }}
            >
              Total due
            </p>
            <p className="text-2xl font-extrabold" style={{ color: dark ? "#ffffff" : accent }}>
              {formatMoney(data.currency, totals.grandTotal)}
            </p>
            <p className="mt-1 text-xs" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
              Due {data.dueDate}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10">
        <div className="flex flex-wrap justify-between gap-4" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#a8a29e" : "#a1a1aa" }}>
              Bill to
            </p>
            <p className="mt-1 font-semibold" style={{ color: dark ? "#fafaf9" : "#18181b" }}>
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
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#a8a29e" : "#a1a1aa" }}>
              Details
            </p>
            <p className="mt-1">Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Payment: {data.paymentTerms}</p> : null}
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
          </div>
        </div>

        <div
          className="mt-6 overflow-hidden rounded-xl border"
          style={{ borderColor: dark ? "#292524" : "#f4f4f5" }}
        >
          {data.items.map((it, i) => (
            <div
              key={it.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
              style={{
                backgroundColor:
                  i % 2 === 0 ? (dark ? "#292524" : "#fafaf9") : "transparent",
              }}
            >
              <div>
                <p className="font-medium" style={{ color: dark ? "#fafaf9" : "#18181b" }}>
                  {itemTitle(it)}
                </p>
                {it.description ? (
                  <p className="text-xs" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
                    {it.description}
                  </p>
                ) : null}
                <p className="text-xs" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
                  {it.qty} × {formatMoney(data.currency, it.rate)} · {it.taxPct}% tax
                  {it.hsn ? ` · HSN ${it.hsn}` : ""}
                </p>
              </div>
              <p className="font-bold">{formatMoney(data.currency, it.qty * it.rate)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex">
          <div className="ml-auto w-64 space-y-1.5 text-[10pt]" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
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
                  {a.type === "percentage"
                    ? formatMoney(data.currency, (totals.subtotal * a.value) / 100)
                    : formatMoney(data.currency, a.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatMoney(data.currency, totals.taxTotal)}</span>
            </div>
            {totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between">
                <span>Adjustments</span>
                <span>{formatMoney(data.currency, totals.adjustmentsTotal)}</span>
              </div>
            ) : null}
            <div className="border-t border-stone-200 pt-2" aria-hidden />
            <div className="flex justify-between text-lg font-bold" style={{ color: dark ? "#fafaf9" : "#18181b" }}>
              <span>Total</span>
              <span>{formatMoney(data.currency, totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-4 text-xs" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
            <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: dark ? "#a8a29e" : "#a1a1aa" }}>
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
          <div className="mt-4 flex gap-6 text-xs" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
            <div className="w-1/2">
              {data.notes ? (
                <>
                  <p className="text-[9pt] font-bold uppercase tracking-wide">Notes</p>
                  <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
                    {data.notes}
                  </p>
                </>
              ) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (
                <>
                  <p className="text-[9pt] font-bold uppercase tracking-wide">Terms</p>
                  <p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
                    {data.terms}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <div className="text-right">
            {data.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.signatureUrl} alt="Signature" className="ml-auto h-12 w-auto object-contain" />
            ) : (
              <div className="ml-auto h-12 w-40 border-b border-stone-300" aria-hidden />
            )}
            <p className="mt-1 text-[8pt]" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
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
    </div>
  );
}
