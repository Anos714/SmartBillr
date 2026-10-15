import { describe, expect, it } from "vitest";
import { newestGuestSavedAt, shouldShowMigrate } from "./sync-client";

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
    expect(shouldShowMigrate(2, new Date().toISOString())).toBe(false);
  });

  it("hides when both empty and flagged", () => {
    expect(shouldShowMigrate(0, "1")).toBe(false);
  });

  it("re-shows when a guest invoice is newer than the flag timestamp", () => {
    const flag = "2026-01-01T00:00:00.000Z";
    expect(shouldShowMigrate(2, flag, "2026-02-01T00:00:00.000Z")).toBe(true);
    expect(shouldShowMigrate(2, flag, "2025-12-31T00:00:00.000Z")).toBe(false);
    expect(shouldShowMigrate(2, flag)).toBe(false);
  });
});

describe("newestGuestSavedAt", () => {
  it("returns null outside a browser with guests", () => {
    // jsdom provides localStorage; empty store -> null
    localStorage.clear();
    expect(newestGuestSavedAt()).toBeNull();
  });
});
