import { describe, expect, it } from "vitest";

import { amountToWords } from "./words";

describe("amountToWords", () => {
  it("zero INR", () => {
    expect(amountToWords(0, "INR")).toBe("Zero Rupees Only");
  });

  it("small number INR", () => {
    expect(amountToWords(295, "INR")).toBe(
      "Two Hundred Ninety-Five Rupees Only",
    );
  });

  it("thousands INR", () => {
    expect(amountToWords(48200, "INR")).toBe(
      "Forty-Eight Thousand Two Hundred Rupees Only",
    );
  });

  it("lakh INR", () => {
    expect(amountToWords(100000, "INR")).toBe("One Lakh Rupees Only");
  });

  it("crore INR", () => {
    expect(amountToWords(10000000, "INR")).toBe("One Crore Rupees Only");
  });

  it("paise INR", () => {
    expect(amountToWords(99.5, "INR")).toBe(
      "Ninety-Nine Rupees and Paise Fifty Only",
    );
  });

  it("USD with cents", () => {
    expect(amountToWords(1234.56, "USD")).toBe(
      "One Thousand Two Hundred Thirty-Four Dollars and Cents Fifty-Six Only",
    );
  });

  it("EUR round amount", () => {
    expect(amountToWords(2500, "EUR")).toBe(
      "Two Thousand Five Hundred Euros Only",
    );
  });

  it("negative amounts get Minus prefix", () => {
    expect(amountToWords(-100, "INR")).toBe("Minus One Hundred Rupees Only");
  });

  it("rounds to 2dp", () => {
    expect(amountToWords(10.999, "USD")).toBe("Eleven Dollars Only");
  });
});
