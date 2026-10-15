import { describe, expect, it } from "vitest";

import { FREE_COUNT, TEMPLATE_CATALOG } from "./templates";
import { getTemplate } from "../components/invoice-templates/registry";
import { MinimalWhitePreview } from "../components/invoice-templates/minimal-white";

const BUILT_IDS = [
  "minimal-white",
  "freelancer-pop",
  "corporate-pro",
  "bold-dark",
  "pastel-creative",
];

const FALLBACK_IDS = [
  "gst-tax-invoice-india",
  "ecommerce-packing",
  "consulting-retainer",
];

describe("paid templates registry", () => {
  it("FREE count is still 2", () => {
    expect(FREE_COUNT).toBe(2);
    expect(TEMPLATE_CATALOG.filter((t) => t.isFree)).toHaveLength(2);
  });

  it("Preview is distinct per built id (not Minimal fallback)", () => {
    const previews = BUILT_IDS.map((id) => getTemplate(id).Preview);
    for (const Preview of previews) {
      expect(typeof Preview).toBe("function");
    }
    // The 3 new paid templates must not reuse the Minimal fallback
    for (const id of ["corporate-pro", "bold-dark", "pastel-creative"]) {
      expect(getTemplate(id).Preview).not.toBe(MinimalWhitePreview);
    }
    // All 5 built previews are distinct components
    expect(new Set(previews).size).toBe(previews.length);
  });

  it("each built PdfDocument is a function", () => {
    for (const id of BUILT_IDS) {
      expect(typeof getTemplate(id).PdfDocument).toBe("function");
    }
  });

  it("only the 3 not-yet-built ids still fall back to Minimal", () => {
    for (const id of FALLBACK_IDS) {
      expect(getTemplate(id).Preview).toBe(MinimalWhitePreview);
    }
  });
});
