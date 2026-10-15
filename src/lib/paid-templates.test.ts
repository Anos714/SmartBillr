import { describe, expect, it } from "vitest";

import { FREE_COUNT, TEMPLATE_CATALOG } from "./templates";
import { getTemplate } from "../components/invoice-templates/registry";

const ALL_IDS = [
  "minimal-white",
  "freelancer-pop",
  "corporate-pro",
  "bold-dark",
  "pastel-creative",
  "gst-tax-invoice-india",
  "ecommerce-packing",
  "consulting-retainer",
];

describe("paid templates registry", () => {
  it("FREE count is still 2", () => {
    expect(FREE_COUNT).toBe(2);
    expect(TEMPLATE_CATALOG.filter((t) => t.isFree)).toHaveLength(2);
  });

  it("all 8 Previews are distinct components", () => {
    const previews = ALL_IDS.map((id) => getTemplate(id).Preview);
    for (const Preview of previews) {
      expect(typeof Preview).toBe("function");
    }
    expect(new Set(previews).size).toBe(previews.length);
  });

  it("all 8 PdfDocuments are functions", () => {
    for (const id of ALL_IDS) {
      expect(typeof getTemplate(id).PdfDocument).toBe("function");
    }
  });

  it("no fallback remains — every catalog id has its own Preview", () => {
    for (const meta of TEMPLATE_CATALOG) {
      expect(ALL_IDS).toContain(meta.id);
    }
    expect(TEMPLATE_CATALOG).toHaveLength(8);
  });
});
