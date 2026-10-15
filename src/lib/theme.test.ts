import { describe, expect, it } from "vitest";

import { FREE_COUNT, TEMPLATE_CATALOG } from "./templates";

describe("theme guard (redesign v2)", () => {
  it("catalog still has 8 templates with 2 free", () => {
    expect(TEMPLATE_CATALOG).toHaveLength(8);
    expect(TEMPLATE_CATALOG.filter((t) => t.isFree)).toHaveLength(2);
    expect(FREE_COUNT).toBe(2);
  });

  it("every template keeps ?template= compatible ids and taglines", () => {
    for (const t of TEMPLATE_CATALOG) {
      expect(t.id).toMatch(/^[a-z0-9-]+$/);
      expect(t.name.length).toBeGreaterThan(0);
      expect(t.tagline.length).toBeGreaterThan(0);
    }
  });
});
