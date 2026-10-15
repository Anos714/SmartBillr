import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
} from "./minimal-white";

export function CorporateProPreview({ data, totals, watermark }: TemplateProps) {
  const accent = resolveAccent(data, "#0F172A");
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const serifNumbers = "Georgia, 'Times New Roman', serif";
  return (
    <div
      className="mx-auto w-full max-w-[800px] overflow-hidden text-sm shadow-sm"
      style={{
        aspectRatio: "1 / 1.414",
        backgroundColor: dark ? "#0b1220" : "#ffffff",
        color: dark ? "#e8edf5" : "#0f172a",
        fontFamily,
      }}
    >
      {/* Full-bleed navy header band */}
      <div className="p-8 sm:p-10" style={{ backgroundColor: accent }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.logoUrl}
                alt="Business logo"
                className="mb-4 h-11 w-auto max-w-[180px] rounded bg-white object-contain p-1"
              />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">
              Invoice
            </p>
            <h1 className="mt-1 text-4xl font-bold tracking-tight text-white">
              {no}
            </h1>
            <p className="mt-3 text-sm font-semibold text-white">
              {data.fromName}
            </p>
            <p className="mt-0.5 text-xs text-white/70">{data.fromEmail}</p>
          </div>
          <div className="text-right text-xs leading-relaxed text-white/75">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              Schedule
            </p>
            <p className="mt-2 text-white">Issued: {data.issueDate}</p>
            <p className="text-white">Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
            <div
              className="ml-auto mt-4 inline-block rounded px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
            >
              Premium
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10">
        {/* 2-column parties */}
        <div className="grid grid-cols-2 gap-6">
          <div style={{ color: dark ? "#cbd5e1" : "#475569" }}>
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Billed by
            </p>
            <p
              className="mt-1 font-semibold"
              style={{ color: dark ? "#f8fafc" : "#0f172a" }}
            >
              {data.fromName}
            </p>
            <p>{data.fromEmail}</p>
            <p className="whitespace-pre-line">{data.fromAddress}</p>
            {data.gstin ? <p>GSTIN: {data.gstin}</p> : null}
            {(data.companyMeta ?? []).map((m, i) => (
              <p key={i} className="text-xs">
                {m.label ? `${m.label}: ` : ""}
                {m.value}
              </p>
            ))}
          </div>
          <div
            className="text-right"
            style={{ color: dark ? "#cbd5e1" : "#475569" }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              Billed to
            </p>
            <p
              className="mt-1 font-semibold"
              style={{ color: dark ? "#f8fafc" : "#0f172a" }}
            >
              {data.billToName}
            </p>
            <p>{data.billToEmail}</p>
            <p className="ml-auto max-w-[260px] whitespace-pre-line">
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

        {/* Hairline table with navy header row */}
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] uppercase tracking-widest text-white"
              style={{ backgroundColor: accent }}
            >
              <th className="px-3 py-2.5 font-semibold">Description</th>
              <th className="w-16 px-2 py-2.5 text-right font-semibold">Qty</th>
              <th className="w-24 px-2 py-2.5 text-right font-semibold">Rate</th>
              <th className="w-16 px-2 py-2.5 text-right font-semibold">Tax%</th>
              <th className="w-24 px-3 py-2.5 text-right font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <tr
                key={it.id}
                className="border-b"
                style={{ borderColor: dark ? "#1e293b" : "#e2e8f0" }}
              >
                <td className="px-3 py-2.5">
                  <p
                    className="font-medium"
                    style={{ color: dark ? "#f8fafc" : "#0f172a" }}
                  >
                    {itemTitle(it)}
                  </p>
                  {it.description ? (
                    <p
                      className="text-xs"
                      style={{ color: dark ? "#94a3b8" : "#64748b" }}
                    >
                      {it.description}
                    </p>
                  ) : null}
                  {it.hsn ? (
                    <p
                      className="text-[11px]"
                      style={{ color: dark ? "#94a3b8" : "#64748b" }}
                    >
                      HSN: {it.hsn}
                    </p>
                  ) : null}
                </td>
                <td
                  className="px-2 py-2.5 text-right"
                  style={{ fontFamily: serifNumbers }}
                >
                  {it.qty}
                </td>
                <td
                  className="px-2 py-2.5 text-right"
                  style={{ fontFamily: serifNumbers }}
                >
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td
                  className="px-2 py-2.5 text-right"
                  style={{ fontFamily: serifNumbers }}
                >
                  {it.taxPct}%
                </td>
                <td
                  className="px-3 py-2.5 text-right font-semibold"
                  style={{
                    fontFamily: serifNumbers,
                    color: dark ? "#f8fafc" : "#0f172a",
                  }}
                >
                  {formatMoney(data.currency, it.qty * it.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals block right */}
        <div className="mt-6 flex">
          <div
            className="ml-auto w-64 space-y-1.5 text-[10pt]"
            style={{ color: dark ? "#cbd5e1" : "#475569" }}
          >
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span style={{ fontFamily: serifNumbers }}>
                {formatMoney(data.currency, totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span style={{ fontFamily: serifNumbers }}>
                -{formatMoney(data.currency, totals.discount)}
              </span>
            </div>
            {(data.adjustments ?? []).map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>
                  {a.label || "Adjustment"}
                  {a.type === "percentage" ? ` (${a.value}%)` : ""}
                </span>
                <span style={{ fontFamily: serifNumbers }}>
                  {a.type === "percentage"
                    ? formatMoney(data.currency, (totals.subtotal * a.value) / 100)
                    : formatMoney(data.currency, a.value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Tax</span>
              <span style={{ fontFamily: serifNumbers }}>
                {formatMoney(data.currency, totals.taxTotal)}
              </span>
            </div>
            {totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between">
                <span>Adjustments</span>
                <span style={{ fontFamily: serifNumbers }}>
                  {formatMoney(data.currency, totals.adjustmentsTotal)}
                </span>
              </div>
            ) : null}
            <div
              className="border-t-2 pt-2"
              style={{ borderColor: accent }}
              aria-hidden
            />
            <div
              className="flex justify-between text-lg font-bold"
              style={{ color: dark ? "#f8fafc" : "#0f172a" }}
            >
              <span>Total</span>
              <span style={{ fontFamily: serifNumbers }}>
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {(data.paymentInfo ?? []).length > 0 ? (
          <div
            className="mt-4 text-xs"
            style={{ color: dark ? "#cbd5e1" : "#475569" }}
          >
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
          <div
            className="mt-4 flex gap-6 text-xs"
            style={{ color: dark ? "#94a3b8" : "#64748b" }}
          >
            <div className="w-1/2">
              {data.notes ? (
                <>
                  <p
                    className="text-[9pt] font-bold uppercase tracking-wide"
                    style={{ color: accent }}
                  >
                    Notes
                  </p>
                  <p
                    className="mt-1 text-[10pt] whitespace-pre-line"
                    style={{ color: dark ? "#cbd5e1" : "#334155" }}
                  >
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
                  <p
                    className="mt-1 text-[10pt] whitespace-pre-line"
                    style={{ color: dark ? "#cbd5e1" : "#334155" }}
                  >
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
                className="ml-auto h-12 w-auto object-contain"
              />
            ) : (
              <div
                className="ml-auto h-12 w-40 border-b"
                style={{ borderColor: dark ? "#334155" : "#cbd5e1" }}
                aria-hidden
              />
            )}
            <p
              className="mt-1 text-[8pt]"
              style={{ color: dark ? "#94a3b8" : "#64748b" }}
            >
              Authorized signature
            </p>
          </div>
        </div>

        {watermark ? (
          <p
            className="mt-8 mb-2 text-center text-[8pt]"
            style={{ color: dark ? "#475569" : "#94a3b8" }}
          >
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
