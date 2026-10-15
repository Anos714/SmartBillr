import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
} from "./minimal-white";

const SERIF = "Georgia, 'Times New Roman', serif";

export function ConsultingRetainerPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#4F46E5");
  const dark = data.theme?.mode === "dark";
  const no = displayNo(data);
  const ink = dark ? "#f0ece2" : "#1c1917";
  const body = dark ? "#c9c2b4" : "#57534e";
  const muted = dark ? "#8f887a" : "#78716c";
  const hairline = dark ? "#2b2a26" : "#e7e5e4";
  const cardBg = dark ? "#171512" : "#fafaf9";
  const totalHours = data.items.reduce((s, it) => s + (it.qty || 0), 0);
  return (
    <div
      className="mx-auto w-full max-w-[800px] text-sm shadow-sm"
      style={{ backgroundColor: dark ? "#100f0d" : "#ffffff", color: ink, fontFamily: SERIF }}
    >
      <div className="px-8 pt-8 sm:px-12" style={{ borderTop: `4px solid ${accent}` }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="Business logo" className="mb-3 h-11 w-auto max-w-[180px] object-contain" />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: accent }}>Retainer Statement</p>
            <h1 className="mt-1 text-4xl font-normal italic tracking-tight">{no}</h1>
            <p className="mt-3 font-semibold not-italic">{data.fromName}</p>
            <p className="whitespace-pre-line text-xs not-italic" style={{ color: body }}>{data.fromAddress}</p>
            <p className="text-xs not-italic" style={{ color: body }}>{data.fromEmail}</p>
          </div>
          {/* Retainer summary card */}
          <div className="w-64 rounded-xl border p-5 not-italic" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Retainer summary</p>
            <p className="mt-2 text-xs" style={{ color: body }}>Period</p>
            <p className="text-sm font-semibold">{data.issueDate} → {data.dueDate}</p>
            <div className="mt-3 flex justify-between border-t pt-3 text-sm" style={{ borderColor: hairline }}>
              <span style={{ color: body }}>Total hours</span>
              <span className="font-bold">{totalHours} hrs</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span style={{ color: body }}>Amount</span>
              <span className="font-bold" style={{ color: accent }}>{formatMoney(data.currency, totals.grandTotal)}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs not-italic" style={{ color: body }}>
          Prepared for <span className="font-semibold" style={{ color: ink }}>{data.billToName}</span> · {data.billToEmail} · <span className="whitespace-pre-line">{data.billToAddress}</span>
        </p>
      </div>

      <div className="px-8 py-6 sm:px-12">
        {/* Timesheet table */}
        <table className="mt-2 w-full border-collapse text-left not-italic">
          <thead>
            <tr className="border-b text-[11px] uppercase tracking-widest" style={{ borderColor: accent, color: muted }}>
              <th className="py-2 pr-2 font-semibold" style={{ fontFamily: SERIF }}>Engagement</th>
              <th className="w-20 py-2 text-right font-semibold">Hrs</th>
              <th className="w-28 py-2 text-right font-semibold">Rate / hr</th>
              <th className="w-28 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="py-3 pr-2">
                  <p className="font-semibold" style={{ fontFamily: SERIF }}>{itemTitle(it)}</p>
                  {it.description ? <p className="text-xs" style={{ color: muted }}>{it.description}</p> : null}
                  {it.taxPct ? <p className="text-[11px]" style={{ color: muted }}>Tax {it.taxPct}%</p> : null}
                </td>
                <td className="py-3 text-right font-bold">{it.qty}</td>
                <td className="py-3 text-right" style={{ color: body }}>{formatMoney(data.currency, it.rate)}</td>
                <td className="py-3 text-right font-semibold">{formatMoney(data.currency, it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex gap-6 not-italic">
          <div className="flex-1">
            {/* paymentTerms highlighted box */}
            {data.paymentTerms ? (
              <div className="rounded-lg border-l-4 p-4" style={{ borderColor: accent, backgroundColor: cardBg }}>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Payment terms</p>
                <p className="mt-1 text-sm font-semibold">{data.paymentTerms}</p>
              </div>
            ) : null}
            {(data.paymentInfo ?? []).length > 0 ? (
              <div className="mt-4 text-xs" style={{ color: body }}>
                <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Payment info</p>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <p key={i} className="mt-0.5 text-[8pt]">{m.label ? `${m.label}: ` : ""}{m.value}</p>
                ))}
              </div>
            ) : null}
            {data.notes || data.terms ? (
              <div className="mt-4 text-xs" style={{ color: muted }}>
                {data.notes ? (<><p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Notes</p><p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>{data.notes}</p></>) : null}
                {data.terms ? (<><p className="mt-3 text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Terms</p><p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>{data.terms}</p></>) : null}
              </div>
            ) : null}
          </div>
          <div className="w-60 space-y-1 text-[10pt]" style={{ color: body }}>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(data.currency, totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(data.currency, totals.discount)}</span></div>
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
            <div className="flex justify-between"><span>Tax</span><span>{formatMoney(data.currency, totals.taxTotal)}</span></div>
            {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between"><span>Adjustments</span><span>{formatMoney(data.currency, totals.adjustmentsTotal)}</span></div>
            ) : null}
            <div className="border-t-2 pt-2" style={{ borderColor: accent }} aria-hidden />
            <div className="flex justify-between text-lg font-bold" style={{ color: ink, fontFamily: SERIF }}>
              <span>Total</span><span>{formatMoney(data.currency, totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end not-italic">
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
          <p className="mt-8 mb-2 text-center text-[8pt] not-italic" style={{ color: muted }}>Made with SmartBillr</p>
        ) : null}
      </div>
    </div>
  );
}
