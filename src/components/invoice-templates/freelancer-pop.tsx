import type { TemplateProps } from "./minimal-white";
import { formatMoney } from "./minimal-white";

export function FreelancerPopPreview({ data, totals, watermark }: TemplateProps) {
  const accent = data.accent || "#4f46e5";
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden rounded-xl bg-white text-sm text-zinc-900 shadow-sm"
      style={{ aspectRatio: "1 / 1.414" }}
    >
      <div className="p-8 sm:p-10" style={{ backgroundColor: accent }}>
        <div className="flex items-start justify-between gap-6 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Invoice
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">{data.invoiceNo}</h1>
            <p className="mt-2 text-white/85">{data.fromName} · {data.fromEmail}</p>
            <p className="max-w-[320px] whitespace-pre-line text-white/75">{data.fromAddress}</p>
          </div>
          <div className="rounded-xl bg-white px-5 py-4 text-right shadow">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
              Total due
            </p>
            <p className="text-2xl font-extrabold" style={{ color: accent }}>
              {formatMoney(data.currency, totals.grandTotal)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">Due {data.dueDate}</p>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10">
        <div className="flex flex-wrap justify-between gap-4 text-zinc-600">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Bill to</p>
            <p className="mt-1 font-semibold text-zinc-900">{data.billToName}</p>
            <p>{data.billToEmail}</p>
            <p className="max-w-[280px] whitespace-pre-line">{data.billToAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Details</p>
            <p className="mt-1">Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-100">
          {data.items.map((it, i) => (
            <div
              key={it.id}
              className={`flex items-center justify-between gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-zinc-50/60" : "bg-white"}`}
            >
              <div>
                <p className="font-medium">{it.desc}</p>
                <p className="text-xs text-zinc-500">
                  {it.qty} × {formatMoney(data.currency, it.rate)} · {it.taxPct}% tax
                </p>
              </div>
              <p className="font-bold">{formatMoney(data.currency, it.qty * it.rate)}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <div className="w-64 space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(data.currency, totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatMoney(data.currency, totals.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatMoney(data.currency, totals.taxTotal)}</span>
            </div>
          </div>
        </div>

        {(data.notes || data.terms) && (
          <div className="mt-6 grid gap-4 text-xs text-zinc-500 sm:grid-cols-2">
            {data.notes ? <p className="whitespace-pre-line rounded-lg bg-zinc-50 p-3">{data.notes}</p> : null}
            {data.terms ? <p className="whitespace-pre-line rounded-lg bg-zinc-50 p-3">{data.terms}</p> : null}
          </div>
        )}

        {watermark ? (
          <p className="mt-8 text-center text-[11px] text-zinc-400">
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
