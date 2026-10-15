import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

export function BoldDarkPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#A3E635");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const bg = dark ? "#0a0a0a" : "#111111";
  const panel = dark ? "#171717" : "#1c1c1c";
  const line = dark ? "#262626" : "#2a2a2a";
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden text-sm shadow-sm"
      style={{
        aspectRatio: "1 / 1.414",
        backgroundColor: bg,
        color: "#fafafa",
        fontFamily,
      }}
    >
      <div className="p-8 sm:p-10">
        {/* Header: logo / invoice no / dates */}
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-3 h-12 w-auto max-w-[180px] rounded-lg object-contain"
                style={{ backgroundColor: "#fafafa", padding: 4 }}
              />
            ) : null}
            <p
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              Invoice
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-white">
              {no}
            </h1>
            <p className="mt-3 font-semibold text-white">{data.fromName}</p>
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
          <div
            className="rounded-2xl px-6 py-5 text-right"
            style={{ backgroundColor: accent }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/60">
              Total due
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight text-black">
              {formatMoney(data.currency, totals.grandTotal)}
            </p>
            <p className="mt-1 text-xs font-medium text-black/70">
              Issued {data.issueDate} · Due {data.dueDate}
            </p>
            {data.paymentTerms ? (
              <p className="text-xs font-medium text-black/70">
                {data.paymentTerms}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bill-by / bill-to + meta lines */}
        <div
          className="mt-6 grid grid-cols-2 gap-4 rounded-2xl p-5"
          style={{ backgroundColor: panel, border: `1px solid ${line}` }}
        >
          <div className="text-white/70">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Billed by
            </p>
            <p className="mt-1 font-semibold text-white">{data.fromName}</p>
            <p className="text-xs">{data.fromEmail}</p>
          </div>
          <div className="text-right text-white/70">
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Billed to
            </p>
            <p className="mt-1 font-semibold text-white">{data.billToName}</p>
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

        {/* Items table */}
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] uppercase tracking-widest"
              style={{ color: accent }}
            >
              <th className="py-2 pr-2 font-bold">Description</th>
              <th className="w-16 py-2 text-right font-bold">Qty</th>
              <th className="w-24 py-2 text-right font-bold">Rate</th>
              <th className="w-16 py-2 text-right font-bold">Tax%</th>
              <th className="w-24 py-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr
                key={it.id}
                className="border-b"
                style={{ borderColor: line }}
              >
                <td className="py-2.5 pr-2">
                  <p className="font-medium text-white">{itemTitle(it)}</p>
                  {it.description ? (
                    <p className="text-xs text-white/55">{it.description}</p>
                  ) : null}
                  {it.hsn ? (
                    <p className="text-[11px] text-white/45">HSN: {it.hsn}</p>
                  ) : null}
                </td>
                <td className="py-2.5 text-right text-white/80">{it.qty}</td>
                <td className="py-2.5 text-right text-white/80">
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td className="py-2.5 text-right text-white/80">{it.taxPct}%</td>
                <td className="py-2.5 text-right font-semibold text-white">
                  {formatMoney(data.currency, it.qty * it.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals block right with glowing divider + big display total */}
        <div className="mt-6 flex">
          <div className="ml-auto w-72 space-y-1.5 text-[10pt] text-white/70">
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
            <div
              className="pt-1"
              aria-hidden
              style={{
                borderBottom: `2px solid ${accent}`,
                boxShadow: `0 0 18px ${accent}`,
              }}
            />
            <div
              className="flex items-baseline justify-between pt-1"
              style={{ color: accent }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.25em]">
                Total
              </span>
              <span className="text-4xl font-black tracking-tight">
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-4 text-xs text-white/60">
            <p
              className="text-[9pt] font-bold uppercase tracking-wide"
              style={{ color: accent }}
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
          <div className="mt-4 flex gap-6 text-xs text-white/55">
            <div className="w-1/2">
              {data.notes ? (
                <>
                  <p
                    className="text-[9pt] font-bold uppercase tracking-wide"
                    style={{ color: accent }}
                  >
                    Notes
                  </p>
                  <p className="mt-1 text-[10pt] whitespace-pre-line text-white/75">
                    {data.notes}
                  </p>
                </>
              ) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (
                <>
                  <p
                    className="text-[9pt] font-bold uppercase tracking-wide"
                    style={{ color: accent }}
                  >
                    Terms
                  </p>
                  <p className="mt-1 text-[10pt] whitespace-pre-line text-white/75">
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
                className="ml-auto h-12 w-auto rounded object-contain"
                style={{ backgroundColor: "#fafafa", padding: 2 }}
              />
            ) : (
              <div
                className="ml-auto h-12 w-40 border-b"
                style={{ borderColor: "#525252" }}
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
