import { describe, expect, it } from "vitest";

import { hasProAccess } from "./billing";
import { canUseTemplate } from "../components/invoice-templates/registry";

describe("billing", () => {
  it("hasProAccess import resolves and denies guests", async () => {
    expect(typeof hasProAccess).toBe("function");
    await expect(hasProAccess(undefined)).resolves.toBe(false);
    await expect(hasProAccess(null)).resolves.toBe(false);
    await expect(hasProAccess("")).resolves.toBe(false);
  });

  it("guest cannot use paid templates (existing paywall path)", () => {
    expect(canUseTemplate(false, "minimal-white")).toBe(true);
    expect(canUseTemplate(false, "corporate-pro")).toBe(false);
    expect(canUseTemplate(true, "corporate-pro")).toBe(true);
  });
});
