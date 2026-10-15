import type { InvoiceData, InvoiceTotals } from "@/lib/invoice";

export type TemplateProps = {
  data: InvoiceData;
  totals: InvoiceTotals;
  watermark?: boolean;
};

export function formatMoney(currency: string, value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function MinimalWhitePreview({ data, totals, watermark }: TemplateProps) {
  const accent = data.accent || "#09090b";
  return (
    <div
      className="mx-auto w-full max-w-[800px] bg-white p-8 text-sm text-zinc-900 shadow-sm sm:p-12"
      style={{ aspectRatio: "1 / 1.414" }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Invoice
          </p>
          <h1
            className="mt-1 text-3xl font-bold"
            style={{ color: accent }}
          >
            {data.invoiceNo}
          </h1>
          <div className="mt-4 space-y-1 text-zinc-600">
            <p className="font-semibold text-zinc-900">{data.fromName}</p>
            <p>{data.fromEmail}</p>
            <p className="max-w-[280px] whitespace-pre-line">{data.fromAddress}</p>
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
          </div>
        </div>
        <div className="text-right text-zinc-600">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Bill to
          </p>
          <p className="mt-1 font-semibold text-zinc-900">{data.billToName}</p>
          <p>{data.billToEmail}</p>
          <p className="ml-auto max-w-[240px] whitespace-pre-line">{data.billToAddress}</p>
          <div className="mt-4 space-y-0.5">
            <p>Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
          </div>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 text-xs uppercase tracking-wide text-zinc-500" style={{ borderColor: accent }}>
            <th className="py-2 pr-2 font-semibold">Description</th>
            <th className="w-16 py-2 text-right font-semibold">Qty</th>
            <th className="w-24 py-2 text-right font-semibold">Rate</th>
            <th className="w-16 py-2 text-right font-semibold">Tax%</th>
            <th className="w-24 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr key={it.id} className="border-b border-zinc-100">
              <td className="py-2 pr-2">{it.desc}</td>
              <td className="py-2 text-right">{it.qty}</td>
              <td className="py-2 text-right">{formatMoney(data.currency, it.rate)}</td>
              <td className="py-2 text-right">{it.taxPct}%</td>
              <td className="py-2 text-right font-medium">
                {formatMoney(data.currency, it.qty * it.rate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal</span>
            <span>{formatMoney(data.currency, totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Discount</span>
            <span>-{formatMoney(data.currency, totals.discount)}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Tax</span>
            <span>{formatMoney(data.currency, totals.taxTotal)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: accent }}>
            <span>Total</span>
            <span>{formatMoney(data.currency, totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {(data.notes || data.terms) && (
        <div className="mt-8 grid gap-4 text-xs text-zinc-500 sm:grid-cols-2">
          {data.notes ? (
            <div>
              <p className="font-semibold uppercase tracking-wide">Notes</p>
              <p className="mt-1 whitespace-pre-line">{data.notes}</p>
            </div>
          ) : null}
          {data.terms ? (
            <div>
              <p className="font-semibold uppercase tracking-wide">Terms</p>
              <p className="mt-1 whitespace-pre-line">{data.terms}</p>
            </div>
          ) : null}
        </div>
      )}

      {watermark ? (
        <p className="mt-10 text-center text-[11px] text-zinc-400">
          Made with SmartBillr
        </p>
      ) : null}
    </div>
  );
}
