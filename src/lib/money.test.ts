import { describe, expect, it } from "vitest";

import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("groups INR with en-IN digits (48,200.00)", () => {
    expect(formatMoney(48200, "INR")).toBe("₹48,200.00");
  });

  it("formats USD with en-US grouping", () => {
    expect(formatMoney(48200, "USD")).toBe("$48,200.00");
  });

  it("keeps two fraction digits and negatives", () => {
    expect(formatMoney(-1234.5, "INR")).toContain("1,234.50");
    expect(formatMoney(-1234.5, "USD")).toBe("-$1,234.50");
  });

  it("falls back to code + toFixed for unknown currency", () => {
    expect(formatMoney(10, "NOTACURR")).toBe("NOTACURR 10.00");
  });

  it("treats non-finite input as zero", () => {
    expect(formatMoney(NaN, "INR")).toBe("₹0.00");
  });
});
