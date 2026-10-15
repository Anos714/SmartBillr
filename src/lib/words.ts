const ONES = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return r === 0 ? TENS[t] : `${TENS[t]}-${ONES[r]}`;
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0
    ? `${ONES[h]} Hundred`
    : `${ONES[h]} Hundred ${twoDigits(rest)}`;
}

/** Indian numbering: Thousand / Lakh / Crore. */
function indianWords(n: number): string {
  if (n < 1000) return threeDigits(n);
  if (n < 100000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    const head = `${twoDigits(th)} Thousand`;
    return rest === 0 ? head : `${head} ${threeDigits(rest)}`;
  }
  if (n < 10000000) {
    const lakh = Math.floor(n / 100000);
    const rest = n % 100000;
    const head = `${indianWords(lakh)} Lakh`;
    return rest === 0 ? head : `${head} ${indianWords(rest)}`;
  }
  const crore = Math.floor(n / 10000000);
  const rest = n % 10000000;
  const head = `${indianWords(crore)} Crore`;
  return rest === 0 ? head : `${head} ${indianWords(rest)}`;
}

/** International numbering: Thousand / Million / Billion. */
function internationalWords(n: number): string {
  if (n < 1000) return threeDigits(n);
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    const head = `${internationalWords(th)} Thousand`;
    return rest === 0 ? head : `${head} ${threeDigits(rest)}`;
  }
  if (n < 1000000000) {
    const m = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const head = `${internationalWords(m)} Million`;
    return rest === 0 ? head : `${head} ${internationalWords(rest)}`;
  }
  const b = Math.floor(n / 1000000000);
  const rest = n % 1000000000;
  const head = `${internationalWords(b)} Billion`;
  return rest === 0 ? head : `${head} ${internationalWords(rest)}`;
}

export type WordsCurrency = "INR" | "USD" | "EUR";

/**
 * Convert a monetary amount to words.
 * - INR uses Indian numbering (Thousand/Lakh/Crore) with Rupees + Paise.
 * - USD/EUR use international numbering with Dollars/Euros + Cents.
 * - Rounds to 2dp; negatives get a "Minus" prefix.
 */
export function amountToWords(
  amount: number,
  currency: WordsCurrency,
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const negative = safe < 0;
  const rounded = Math.round(Math.abs(safe) * 100) / 100;
  const intPart = Math.floor(rounded);
  const fracPart = Math.round((rounded - intPart) * 100);

  const intWords =
    currency === "INR"
      ? indianWords(intPart)
      : internationalWords(intPart);
  const fracWords =
    fracPart === 0
      ? ""
      : currency === "INR"
        ? indianWords(fracPart)
        : internationalWords(fracPart);

  const mainUnit =
    currency === "INR" ? "Rupees" : currency === "USD" ? "Dollars" : "Euros";
  const fracUnit = currency === "INR" ? "Paise" : "Cents";

  let out =
    fracPart === 0
      ? `${intWords} ${mainUnit} Only`
      : `${intWords} ${mainUnit} and ${fracUnit} ${fracWords} Only`;

  if (negative) out = `Minus ${out}`;
  return out;
}
