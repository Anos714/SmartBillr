import type { InvoiceData, InvoiceTotals } from "@/lib/invoice";
import { invoiceDisplayNo } from "@/lib/invoice";

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

export function resolveAccent(data: InvoiceData, fallback: string): string {
  return data.theme?.baseColor || data.accent || fallback;
}

export function displayNo(data: InvoiceData): string {
  return invoiceDisplayNo({
    prefix: data.prefix ?? "",
    serialNumber: data.serialNumber ?? "",
    invoiceNo: data.invoiceNo,
  });
}

export function itemTitle(it: { name?: string; desc?: string }): string {
  if (it.name && it.name.trim()) return it.name;
  if (it.desc && it.desc.trim()) return it.desc;
  return "Untitled item";
}

export function themeFontFamily(font: string | undefined): string {
  if (font === "serif") return "Georgia, 'Times New Roman', serif";
  if (font === "inter") return "Inter, system-ui, sans-serif";
  return "Geist, system-ui, -apple-system, sans-serif";
}

export function MinimalWhitePreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0C6B4F");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  return (
    <div
      className="mx-auto w-full max-w-[800px] p-8 text-sm shadow-sm sm:p-12"
      style={{
        aspectRatio: "1 / 1.414",
        backgroundColor: dark ? "#1a1a18" : "#ffffff",
        color: dark ? "#f5f4f0" : "#18181b",
        fontFamily,
      }}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logoUrl}
              alt="Business logo"
              className="mb-3 h-12 w-auto max-w-[180px] object-contain"
            />
          ) : null}
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: dark ? "#a8a29e" : "#a1a1aa" }}
          >
            Invoice
          </p>
          <h1 className="mt-1 text-3xl font-bold" style={{ color: accent }}>
            {no}
          </h1>
          <div
            className="mt-4 space-y-1"
            style={{ color: dark ? "#d6d3d1" : "#52525b" }}
          >
            <p className="font-semibold" style={{ color: dark ? "#fafaf9" : "#18181b" }}>
              {data.fromName}
            </p>
            <p>{data.fromEmail}</p>
            <p className="max-w-[280px] whitespace-pre-line">{data.fromAddress}</p>
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i}>
                {m.label ? `${m.label}: ` : ""}{m.value}
              </p>
            ))}
          </div>
        </div>
        <div style={{ color: dark ? "#d6d3d1" : "#52525b" }} className="text-right">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: dark ? "#a8a29e" : "#a1a1aa" }}
          >
            Bill to
          </p>
          <p className="mt-1 font-semibold" style={{ color: dark ? "#fafaf9" : "#18181b" }}>
            {data.billToName}
          </p>
          <p>{data.billToEmail}</p>
          <p className="ml-auto max-w-[240px] whitespace-pre-line">{data.billToAddress}</p>
          {(data.clientMeta ?? []).map((m, i) => (
            <p key={i}>
              {m.label ? `${m.label}: ` : ""}{m.value}
            </p>
          ))}
          <div className="mt-4 space-y-0.5">
            <p>Issued: {data.issueDate}</p>
            <p>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
          </div>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr
            className="border-b-2 text-xs uppercase tracking-wide"
            style={{ borderColor: accent, color: dark ? "#a8a29e" : "#71717a" }}
          >
            <th className="py-2 pr-2 font-semibold">Description</th>
            <th className="w-16 py-2 text-right font-semibold">Qty</th>
            <th className="w-24 py-2 text-right font-semibold">Rate</th>
            <th className="w-16 py-2 text-right font-semibold">Tax%</th>
            <th className="w-24 py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it) => (
            <tr
              key={it.id}
              className="border-b"
              style={{ borderColor: dark ? "#292524" : "#f4f4f5" }}
            >
              <td className="py-2 pr-2">
                <p className="font-medium">{itemTitle(it)}</p>
                {it.description ? (
                  <p className="text-xs" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
                    {it.description}
                  </p>
                ) : null}
                {it.hsn ? (
                  <p className="text-[11px]" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
                    HSN: {it.hsn}
                  </p>
                ) : null}
              </td>
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

      <div className="mt-6 flex">
        <div className="ml-auto w-64 space-y-1.5" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
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
            className="flex justify-between border-t pt-2 text-base font-bold"
            style={{ borderColor: accent, color: dark ? "#fafaf9" : "#18181b" }}
          >
            <span>Total</span>
            <span>{formatMoney(data.currency, totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      {(data.notes || data.terms) && (
        <div className="mt-8 grid gap-4 text-xs sm:grid-cols-2" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
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

      <div className="mt-6 flex items-end justify-between gap-6">
        <div className="min-w-0 flex-1 text-xs" style={{ color: dark ? "#d6d3d1" : "#52525b" }}>
          {(data.paymentInfo ?? []).length > 0 ? (
            <div>
              <p className="font-semibold uppercase tracking-wide">Payment info</p>
              {(data.paymentInfo ?? []).map((m, i) => (
                <p key={i} className="mt-1">
                  {m.label ? `${m.label}: ` : ""}{m.value}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <div className="ml-auto shrink-0 text-right">
          {data.signatureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.signatureUrl} alt="Signature" className="ml-auto h-12 w-auto object-contain" />
          ) : (
            <div className="ml-auto h-12 w-40 border-b border-stone-300" aria-hidden />
          )}
          <p className="mt-1 text-[10px]" style={{ color: dark ? "#a8a29e" : "#71717a" }}>
            Authorized signature
          </p>
        </div>
      </div>

      {watermark ? (
        <p className="mt-10 text-center text-[11px]" style={{ color: dark ? "#78716c" : "#a1a1aa" }}>
          Made with SmartBillr
        </p>
      ) : null}
    </div>
  );
}
