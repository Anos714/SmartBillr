import type { InvoiceCurrency } from "./invoice";

/**
 * Single canonical money formatter for the whole app.
 *
 * - INR uses the en-IN locale (₹48,200.00 grouping).
 * - All other currencies use en-US.
 * - Output is plain unicode (₹ included) — safe for both DOM previews
 *   and @react-pdf rendering with the DejaVu-based invoice font.
 */
export function formatMoney(
  amount: number,
  currency: InvoiceCurrency | string,
): string {
  const n = Number(amount);
  const value = Number.isFinite(n) ? n : 0;
  const locale = currency === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
