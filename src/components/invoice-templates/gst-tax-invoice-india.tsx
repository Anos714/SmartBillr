import type { TemplateProps } from "./minimal-white";
import {
  displayNo,
  formatMoney,
  itemTitle,
  resolveAccent,
  themeFontFamily,
  lineAmount,
  adjustmentAmount,
} from "./minimal-white";
import { amountToWords } from "@/lib/words";

const GREEN = "#0C6B4F";
const GOLD = "#C9A227";
const SAFFRON = "#FF9933";
const INDIA_GREEN = "#138808";
const DISPLAY_SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

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
  const accent = resolveAccent(data, GREEN);
  const dark = data.theme?.mode === "dark";
  const fontFamily = themeFontFamily(data.theme?.font);
  const no = displayNo(data);
  const ink = dark ? "#e8edf5" : "#0f172a";
  const body = dark ? "#cbd5e1" : "#475569";
  const muted = dark ? "#94a3b8" : "#64748b";
  const hairline = dark ? "#1e293b" : "#e2e8f0";
  const cardBg = dark ? "#111c2e" : "#f8fafc";
  const wordsBg = dark ? "#12291f" : "#f2f8f5";
  const companyGstin = (data.gstin ?? "").trim() || lookupGstin(data.companyMeta);
  const clientGstin = lookupGstin(data.clientMeta);
  const isInr = data.currency === "INR";
  const taxable = totals.subtotal - totals.discount;
  const cgst = totals.taxTotal / 2;
  const sgst = totals.taxTotal / 2;
  const words = amountToWords(totals.grandTotal, data.currency);
  return (
    <div
      className="mx-auto w-full max-w-[800px] text-sm shadow-sm"
      style={{ backgroundColor: dark ? "#0b1220" : "#ffffff", color: ink, fontFamily }}
    >
      {/* Restrained saffron / white / green tri-hairline */}
      <div aria-hidden>
        <div className="h-px" style={{ backgroundColor: SAFFRON }} />
        <div className="h-px" style={{ backgroundColor: dark ? "#1e293b" : "#e9edf2" }} />
        <div className="h-px" style={{ backgroundColor: INDIA_GREEN }} />
      </div>

      {/* Deep-green masthead */}
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
            <p
              className="text-[11px] font-semibold uppercase text-white/60"
              style={{ letterSpacing: "0.18em", fontFamily: DISPLAY_SERIF }}
            >
              Tax Invoice
            </p>
            <h1
              className="mt-2 text-[38px] leading-none font-normal tracking-tight text-white"
              style={{ fontFamily: DISPLAY_SERIF }}
            >
              {no}
            </h1>
            <p className="mt-3 text-sm font-semibold text-white">{data.fromName}</p>
            <p className="mt-0.5 max-w-[320px] whitespace-pre-line text-xs text-white/70">
              {data.fromAddress}
            </p>
            <p className="mt-0.5 text-xs text-white/70">{data.fromEmail}</p>
            {(data.companyMeta ?? [])
              .filter((m) => (m.label ?? "").trim().toLowerCase() !== "gstin")
              .map((m, i) => (
                <p key={i} className="text-xs text-white/70">
                  {m.label ? `${m.label}: ` : ""}
                  {m.value}
                </p>
              ))}
          </div>
          <div className="text-right text-xs leading-relaxed text-white/75 tabular-nums" style={TABULAR}>
            <p
              className="text-[11px] font-semibold uppercase text-white/60"
              style={{ letterSpacing: "0.18em" }}
            >
              Details
            </p>
            <p className="mt-2 text-white">Issued: {data.issueDate}</p>
            <p className="text-white">Due: {data.dueDate}</p>
            {data.paymentTerms ? <p>Terms: {data.paymentTerms}</p> : null}
            <div
              className="ml-auto mt-4 inline-block rounded px-3 py-1 text-[10px] font-bold uppercase"
              style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff", letterSpacing: "0.18em" }}
            >
              Premium
            </div>
          </div>
        </div>
      </div>
      {/* Fixed gold hairline rule */}
      <div className="h-[3px]" style={{ backgroundColor: GOLD }} aria-hidden />
      <div className="h-px" style={{ backgroundColor: hairline }} aria-hidden />

      <div className="p-8 sm:p-10">
        {/* Parties with GSTIN chips */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
            >
              Billed by
            </p>
            <p className="mt-2 text-[15px] font-semibold" style={{ color: ink }}>
              {data.fromName}
            </p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>
              {data.fromAddress}
            </p>
            <span
              className="mt-2 inline-block rounded border px-2 py-0.5 text-[11px]"
              style={{ borderColor: hairline, fontFamily: MONO, color: body }}
            >
              GSTIN: {companyGstin}
            </span>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: hairline, backgroundColor: cardBg }}>
            <p
              className="text-[11px] font-bold uppercase"
              style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
            >
              Billed to
            </p>
            <p className="mt-2 text-[15px] font-semibold" style={{ color: ink }}>
              {data.billToName}
            </p>
            <p className="whitespace-pre-line text-xs" style={{ color: body }}>
              {data.billToAddress}
            </p>
            <p className="text-xs" style={{ color: body }}>
              {data.billToEmail}
            </p>
            {(data.clientMeta ?? [])
              .filter((m) => (m.label ?? "").trim().toLowerCase() !== "gstin")
              .map((m, i) => (
                <p key={i} className="text-xs" style={{ color: body }}>
                  {m.label ? `${m.label}: ` : ""}
                  {m.value}
                </p>
              ))}
            <span
              className="mt-2 inline-block rounded border px-2 py-0.5 text-[11px]"
              style={{ borderColor: hairline, fontFamily: MONO, color: body }}
            >
              GSTIN: {clientGstin}
            </span>
          </div>
        </div>

        {/* HSN table — pinstripe header + double gold rule */}
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr
              className="text-[11px] uppercase text-white"
              style={{
                backgroundColor: accent,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)",
              }}
            >
              <th className="px-3 py-3 font-semibold" style={{ letterSpacing: "0.18em" }}>#</th>
              <th className="px-3 py-3 font-semibold" style={{ letterSpacing: "0.18em" }}>Description</th>
              <th className="w-24 px-2 py-3 font-semibold" style={{ letterSpacing: "0.18em" }}>HSN/SAC</th>
              <th className="w-14 px-2 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Qty</th>
              <th className="w-24 px-2 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>Rate</th>
              <th className="w-24 px-3 py-3 text-right font-semibold tabular-nums" style={{ letterSpacing: "0.18em", ...TABULAR }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr aria-hidden>
              <td colSpan={6} className="p-0">
                <div className="h-[2px]" style={{ backgroundColor: GOLD }} />
                <div className="h-px" style={{ backgroundColor: hairline }} />
              </td>
            </tr>
            {data.items.map((it, idx) => (
              <tr key={it.id} className="border-b" style={{ borderColor: hairline }}>
                <td className="px-3 py-3" style={{ color: muted }}>
                  {idx + 1}
                </td>
                <td className="px-3 py-3">
                  <p className="text-sm font-semibold" style={{ color: ink }}>
                    {itemTitle(it)}
                  </p>
                  {it.description ? (
                    <p className="mt-0.5 text-xs" style={{ color: muted }}>
                      {it.description}
                    </p>
                  ) : null}
                </td>
                <td className="px-2 py-3 text-xs" style={{ fontFamily: MONO, color: body }}>
                  {it.hsn || "—"}
                </td>
                <td
                  className="px-2 py-3 text-right tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, color: body, ...TABULAR }}
                >
                  {it.qty}
                </td>
                <td
                  className="px-2 py-3 text-right tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, color: body, ...TABULAR }}
                >
                  {formatMoney(data.currency, it.rate)}
                </td>
                <td
                  className="px-3 py-3 text-right font-semibold tabular-nums"
                  style={{ fontFamily: DISPLAY_SERIF, color: ink, ...TABULAR }}
                >
                  {formatMoney(data.currency, lineAmount(totals, it.id))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex gap-6">
          <div className="flex-1">
            {/* Amount in words — bordered highlight box, serif italic */}
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: GOLD, backgroundColor: wordsBg }}
            >
              <p
                className="text-[11px] font-bold uppercase"
                style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
              >
                Amount in words
              </p>
              <p
                className="mt-1 text-[15px] leading-relaxed italic"
                style={{ fontFamily: DISPLAY_SERIF, color: ink }}
              >
                {words}
              </p>
            </div>
            {(data.paymentInfo ?? []).length > 0 ? (
              <div className="mt-8 text-xs" style={{ color: body }}>
                <p
                  className="text-[11px] font-bold uppercase"
                  style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
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
          </div>
          {/* Totals — CGST/SGST split, serif numerals, gold divider */}
          <div
            className="w-64 space-y-1.5 text-[10pt] tabular-nums"
            style={{ color: body, ...TABULAR }}
          >
            <div className="flex justify-between">
              <span>Taxable Value</span>
              <span style={{ fontFamily: DISPLAY_SERIF }}>
                {formatMoney(data.currency, taxable)}
              </span>
            </div>
            {isInr ? (
              <>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span style={{ fontFamily: DISPLAY_SERIF }}>
                    {formatMoney(data.currency, cgst)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span style={{ fontFamily: DISPLAY_SERIF }}>
                    {formatMoney(data.currency, sgst)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>Tax</span>
                <span style={{ fontFamily: DISPLAY_SERIF }}>
                  {formatMoney(data.currency, totals.taxTotal)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Discount</span>
              <span style={{ fontFamily: DISPLAY_SERIF }}>
                -{formatMoney(data.currency, totals.discount)}
              </span>
            </div>
            {(data.adjustments ?? []).map((a) => (
              <div key={a.id} className="flex justify-between text-xs">
                <span>
                  {a.label || "Adjustment"}
                  {a.type === "percentage" ? ` (${a.value}%)` : ""}
                </span>
                <span style={{ fontFamily: DISPLAY_SERIF }}>
                  {formatMoney(data.currency, adjustmentAmount(totals, a.id))}
                </span>
              </div>
            ))}
            {(data.adjustments ?? []).length > 1 && totals.adjustmentsTotal !== 0 ? (
              <div className="flex justify-between">
                <span>Adjustments</span>
                <span style={{ fontFamily: DISPLAY_SERIF }}>
                  {formatMoney(data.currency, totals.adjustmentsTotal)}
                </span>
              </div>
            ) : null}
            <div aria-hidden>
              <div className="h-[2px]" style={{ backgroundColor: GOLD }} />
              <div className="mt-[3px] border-t" style={{ borderColor: hairline }} />
            </div>
            <div className="flex items-baseline justify-between pt-1" style={{ color: ink }}>
              <span
                className="text-[11px] font-bold uppercase"
                style={{ letterSpacing: "0.18em", color: muted }}
              >
                Grand Total
              </span>
              <span
                style={{ fontFamily: DISPLAY_SERIF }}
                className="text-[26px] font-normal tracking-tight"
              >
                {formatMoney(data.currency, totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {data.notes || data.terms ? (
          <div className="mt-8 flex gap-6 text-xs" style={{ color: muted }}>
            <div className="w-1/2">
              {data.notes ? (
                <>
                  <p
                    className="text-[11px] font-bold uppercase"
                    style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
                  >
                    Notes
                  </p>
                  <p className="mt-1 text-xs whitespace-pre-line" style={{ color: body }}>
                    {data.notes}
                  </p>
                </>
              ) : null}
            </div>
            <div className="w-1/2">
              {data.terms ? (
                <>
                  <p
                    className="text-[11px] font-bold uppercase"
                    style={{ color: dark ? GOLD : accent, letterSpacing: "0.18em" }}
                  >
                    Terms
                  </p>
                  <p className="mt-1 text-xs whitespace-pre-line" style={{ color: body }}>
                    {data.terms}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Authorised signatory with ruled line */}
        <div className="mt-8 flex justify-end">
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
                style={{ borderColor: muted }}
                aria-hidden
              />
            )}
            <p className="mt-1 text-[8pt]" style={{ color: muted }}>
              Authorised Signatory
            </p>
          </div>
        </div>

        {watermark ? (
          <p className="mt-8 mb-2 text-center text-[8pt]" style={{ color: muted }}>
            Made with SmartBillr
          </p>
        ) : null}
      </div>
    </div>
  );
}
