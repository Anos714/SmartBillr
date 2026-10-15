import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

export function EcommercePackingPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0EA5E9");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const ink = dark ? "#eef4fa" : "#0f172a";
  const body = dark ? "#b9c7d8" : "#475569";
  const muted = dark ? "#7d93ab" : "#64748b";
  const hairline = dark ? "#1d2f44" : "#e2e8f0";
  const cardBg = dark ? "#101f30" : "#f8fafc";
  const totalQty = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden text-sm shadow-sm"
      style={{ aspectRatio: "1 / 1.414", backgroundColor: dark ? "#0a141f" : "#ffffff", color: ink, fontFamily }}
    >
      {/* Order / invoice no bar */}
      <div className="flex items-center justify-between gap-4 px-8 py-5 sm:px-10" style={{ backgroundColor: accent }}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">Packing Slip</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">{no}</h1>
        </div>
        <div className="text-right text-xs text-white">
          <p>Order: {no}</p>
          <p className="text-white/80">Issued {data.issueDate} · Due {data.dueDate}</p>
          <p className="mt-1 inline-block rounded bg-black/20 px-2 py-0.5 font-semibold">{totalQty} items · {data.items.length} lines</p>
        </div>
      </div>
      {/* Barcode-ish stripe decoration */}
      <div className="flex h-6 items-stretch gap-[3px] px-8 py-1.5 sm:px-10" aria-hidden
        style={{ backgroundImage: dark ? undefined : `repeating-linear-gradient(90deg, ${ink} 0 2px, transparent 2px 5px, ${ink} 5px 6px, transparent 6px 11px)` }}>
        {dark ? Array.from({ length: 60 }).map((_, i) => (
          <div key={i} style={{ width: i % 3 === 0 ? 3 : 1.5, backgroundColor: "#e2e8f0" }} />
        )) : null}
      </div>

      <div className="px-8 py-6 sm:px-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border-2 p-4" style={{ borderColor: accent, backgroundColor: cardBg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Ship to</p>
            <p className="mt-1 font-semibold">{data.billToName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.billToAddress}</p>
            <p className="text-xs" style={{ color: body }}>{data.billToEmail}</p>
            {(data.clientMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs" style={{ color: body }}>{m.label ? `${m.label}: ` : ""}{m.value}</p>
            ))}
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Bill to</p>
            <p className="mt-1 font-semibold">{data.billToName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.billToAddress}</p>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: ink }}>{data.fromName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.fromAddress}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 text-[11px] uppercase tracking-widest" style={{ borderColor: accent, color: muted }}>
              <th className="py-2 pr-2 font-bold">SKU</th>
              <th className="py-2 pr-2 font-bold">Item</th>
              <th className="w-16 py-2 text-center font-bold">Qty</th>
              <th className="w-24 py-2 text-right font-bold">Rate</th>
              <th className="w-24 py-2 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, idx) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="py-2.5 pr-2 font-mono text-xs font-semibold" style={{ color: accent }}>
                  {it.hsn || `SKU-${String(idx + 1).padStart(3, "0")}`}
                </td>
                <td className="py-2.5 pr-2">
                  <p className="font-medium">{itemTitle(it)}</p>
                  {it.description ? <p className="text-xs" style={{ color: muted }}>{it.description}</p> : null}
                </td>
                <td className="py-2.5 text-center text-base font-bold">{it.qty}</td>
                <td className="py-2.5 text-right" style={{ color: body }}>{formatMoney(data.currency, it.rate)}</td>
                <td className="py-2.5 text-right font-semibold">{formatMoney(data.currency, it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex gap-6">
          <div className="flex-1 rounded-lg p-4 text-center" style={{ backgroundColor: cardBg, border: `1px dashed ${accent}` }}>
            <p className="text-sm font-bold" style={{ color: ink }}>Thank you for shopping with {data.fromName}!</p>
            {data.notes ? <p className="mt-1 whitespace-pre-line text-xs" style={{ color: body }}>{data.notes}</p> : null}
            {data.terms ? <p className="mt-1 whitespace-pre-line text-xs" style={{ color: muted }}>{data.terms}</p> : null}
          </div>
          <div className="w-60 space-y-1 text-[10pt]" style={{ color: body }}>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(data.currency, totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(data.currency, totals.discount)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatMoney(data.currency, totals.taxTotal)}</span></div>
            {totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between"><span>Adjustments</span><span>{formatMoney(data.currency, totals.adjustmentsTotal)}</span></div>
            ) : null}
            <div className="border-t-2 pt-2" style={{ borderColor: accent }} aria-hidden />
            <div className="flex justify-between text-lg font-bold" style={{ color: ink }}>
              <span>Total</span><span>{formatMoney(data.currency, totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div className="mt-4 text-xs" style={{ color: body }}>
            <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Payment info</p>
            {(data.paymentInfo ?? []).map((m, i) => (
              <p key={i} className="mt-0.5 text-[8pt]">{m.label ? `${m.label}: ` : ""}{m.value}</p>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end">
          <div className="text-right">
            {data.signatureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.signatureUrl} alt="Signature" className="ml-auto h-12 w-auto object-contain" />
            ) : (
              <div className="ml-auto h-12 w-40 border-b" style={{ borderColor: muted }} aria-hidden />
            )}
            <p className="mt-1 text-[8pt]" style={{ color: muted }}>Authorized signature</p>
          </div>
        </div>

        {watermark ? (
          <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: muted }}>Made with SmartBillr</p>
        ) : null}
      </div>
    </div>
  );
}
