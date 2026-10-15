import { describe, expect, it } from "vitest";

import { FREE_COUNT, TEMPLATE_CATALOG } from "./templates";

describe("TEMPLATE_CATALOG", () => {
  it("has exactly 8 templates", () => {
    expect(TEMPLATE_CATALOG).toHaveLength(8);
  });

  it("has exactly 2 free templates", () => {
    const free = TEMPLATE_CATALOG.filter((t) => t.isFree);
    expect(free).toHaveLength(2);
    expect(FREE_COUNT).toBe(2);
    expect(free).toHaveLength(FREE_COUNT);
  });

  it("has unique ids", () => {
    const ids = TEMPLATE_CATALOG.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes the paid GST template for India", () => {
    const gst = TEMPLATE_CATALOG.find((t) => t.id === "gst-tax-invoice-india");
    expect(gst).toBeDefined();
    expect(gst?.isFree).toBe(false);
  });
});
