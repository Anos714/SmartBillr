import { describe, expect, it } from "vitest";
import { shouldShowMigrate } from "./sync-client";

describe("shouldShowMigrate", () => {
  it("shows when guest invoices exist and flag is absent", () => {
    expect(shouldShowMigrate(3, null)).toBe(true);
  });

  it("hides when there are no guest invoices", () => {
    expect(shouldShowMigrate(0, null)).toBe(false);
  });

  it("hides after dismiss/sync flag is set", () => {
    expect(shouldShowMigrate(5, "1")).toBe(false);
    expect(shouldShowMigrate(1, "dismissed")).toBe(false);
  });

  it("hides when both empty and flagged", () => {
    expect(shouldShowMigrate(0, "1")).toBe(false);
  });
});
