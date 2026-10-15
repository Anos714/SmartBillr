import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";
import { amountToWords } from "@/lib/words";

function lookupGstin(
  meta: { label: string; value: string }[] | undefined,
): string {
  const hit = (meta ?? []).find(
    (m) => (m.label ?? "").trim().toLowerCase() === "gstin",
  );
  const v = (hit?.value ?? "").trim();
  return v || "—";
}

export function GstTaxInvoiceIndiaPreview({
  data,
  totals,
  watermark,
}: TemplateProps) {
  const accent = resolveAccent(data, "#0F766E");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const ink = dark ? "#e8edf5" : "#0f172a";
  const body = dark ? "#cbd5e1" : "#475569";
  const muted = dark ? "#94a3b8" : "#64748b";
  const hairline = dark ? "#1e293b" : "#e2e8f0";
  const cardBg = dark ? "#111c2e" : "#f8fafc";
  const companyGstin = (data.gstin ?? "").trim() || lookupGstin(data.companyMeta);
  const clientGstin = lookupGstin(data.clientMeta);
  const isInr = data.currency === "INR";
  const taxable = totals.subtotal - totals.discount;
  const cgst = totals.taxTotal / 2;
  const sgst = totals.taxTotal / 2;
  const words = amountToWords(totals.grandTotal, data.currency);
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden text-sm shadow-sm"
      style={{ aspectRatio: "1 / 1.414", backgroundColor: dark ? "#0b1220" : "#ffffff", color: ink, fontFamily }}
    >
      {/* Tricolor micro-accent hairline */}
      <div className="flex h-1.5" aria-hidden>
        <div className="flex-1" style={{ backgroundColor: "#FF9933" }} />
        <div className="flex-1" style={{ backgroundColor: dark ? "#1e293b" : "#ffffff", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }} />
        <div className="flex-1" style={{ backgroundColor: "#138808" }} />
      </div>
      <div className="border-b px-8 py-6 sm:px-10" style={{ borderColor: hairline }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="Business logo" className="mb-3 h-11 w-auto max-w-[180px] object-contain" />
            ) : null}
            <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: accent }}>
              Tax Invoice
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{no}</h1>
            <p className="mt-2 font-semibold">{data.fromName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.fromAddress}</p>
            <p className="text-xs" style={{ color: body }}>GSTIN: {companyGstin}</p>
            <p className="text-xs" style={{ color: body }}>{data.fromEmail}</p>
          </div>
          <div className="text-right text-xs leading-relaxed" style={{ color: body }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Details</p>
            <p className="mt-2" style={{ color: ink }}>Issued: {data.issueDate}</p>
            <p style={{ color: ink }}>Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
            <div className="ml-auto mt-3 inline-block rounded px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white" style={{ backgroundColor: accent }}>
              Premium
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 sm:px-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Billed by</p>
            <p className="mt-1 font-semibold">{data.fromName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.fromAddress}</p>
            <p className="text-xs" style={{ color: body }}>GSTIN: {companyGstin}</p>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Billed to</p>
            <p className="mt-1 font-semibold">{data.billToName}</p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>{data.billToAddress}</p>
            <p className="text-xs" style={{ color: body }}>GSTIN: {clientGstin}</p>
            <p className="text-xs" style={{ color: body }}>{data.billToEmail}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="text-[11px] uppercase tracking-widest text-white" style={{ backgroundColor: accent }}>
              <th className="px-3 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Description</th>
              <th className="w-24 px-2 py-2.5 font-semibold">HSN/SAC</th>
              <th className="w-14 px-2 py-2.5 text-right font-semibold">Qty</th>
              <th className="w-24 px-2 py-2.5 text-right font-semibold">Rate</th>
              <th className="w-24 px-3 py-2.5 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, idx) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="px-3 py-2.5" style={{ color: muted }}>{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium">{itemTitle(it)}</p>
                  {it.description ? <p className="text-xs" style={{ color: muted }}>{it.description}</p> : null}
                </td>
                <td className="px-2 py-2.5 text-xs" style={{ color: body }}>{it.hsn || "—"}</td>
                <td className="px-2 py-2.5 text-right">{it.qty}</td>
                <td className="px-2 py-2.5 text-right">{formatMoney(data.currency, it.rate)}</td>
                <td className="px-3 py-2.5 text-right font-semibold">{formatMoney(data.currency, it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex gap-6">
          <div className="flex-1">
            <div className="rounded-lg border-2 p-4" style={{ borderColor: accent, backgroundColor: cardBg }}>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accent }}>Amount in words</p>
              <p className="mt-1 text-[13px] font-semibold leading-relaxed">{words}</p>
            </div>
            {(data.paymentInfo ?? []).length > 0 ? (
              <div className="mt-4 text-xs" style={{ color: body }}>
                <p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Payment info</p>
                {(data.paymentInfo ?? []).map((m, i) => (
                  <p key={i} className="mt-0.5 text-[8pt]">{m.label ? `${m.label}: ` : ""}{m.value}</p>
                ))}
              </div>
            ) : null}
          </div>
          <div className="w-64 space-y-1.5 text-[10pt]" style={{ color: body }}>
            <div className="flex justify-between"><span>Taxable Value</span><span>{formatMoney(data.currency, taxable)}</span></div>
            {isInr ? (
              <>
                <div className="flex justify-between"><span>CGST</span><span>{formatMoney(data.currency, cgst)}</span></div>
                <div className="flex justify-between"><span>SGST</span><span>{formatMoney(data.currency, sgst)}</span></div>
              </>
            ) : (
              <div className="flex justify-between"><span>Tax</span><span>{formatMoney(data.currency, totals.taxTotal)}</span></div>
            )}
            {(data.adjustments ?? []).map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>{a.label || "Adjustment"}{a.type === "percentage" ? ` (${a.value}%)` : ""}</span>
                <span>{a.type === "percentage" ? formatMoney(data.currency, (totals.subtotal * a.value) / 100) : formatMoney(data.currency, a.value)}</span>
              </div>
            ))}
            {totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between"><span>Adjustments</span><span>{formatMoney(data.currency, totals.adjustmentsTotal)}</span></div>
            ) : null}
            <div className="border-t-2 pt-2" style={{ borderColor: accent }} aria-hidden />
            <div className="flex justify-between text-lg font-bold" style={{ color: ink }}>
              <span>Grand Total</span>
              <span>{formatMoney(data.currency, totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {data.notes || data.terms ? (
          <div className="mt-4 flex gap-6 text-xs" style={{ color: muted }}>
            <div className="w-1/2">
              {data.notes ? (<><p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Notes</p><p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>{data.notes}</p></>) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (<><p className="text-[9pt] font-bold uppercase tracking-wide" style={{ color: accent }}>Terms</p><p className="mt-1 text-[10pt] whitespace-pre-line" style={{ color: body }}>{data.terms}</p></>) : null}
            </div>
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
            <p className="mt-1 text-[8pt]" style={{ color: muted }}>Authorised Signatory</p>
          </div>
        </div>

        {watermark ? (
          <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: muted }}>Made with SmartBillr</p>
        ) : null}
      </div>
    </div>
  );
}
