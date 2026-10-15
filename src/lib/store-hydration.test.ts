import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_INVOICE } from "./invoice";
import { STORAGE_KEY, useGuestStore } from "./guest-store";

beforeEach(() => {
  localStorage.clear();
  // Reset singleton to SSR-safe defaults without touching localStorage.
  useGuestStore.setState({ invoice: DEFAULT_INVOICE, updatedAt: null });
});

describe("guest store hydration (SSR-safe init)", () => {
  it("initializes to defaults with null updatedAt without reading localStorage", () => {
    // Seed storage first: a hydration-safe store must ignore it until rehydrate().
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        invoice: { ...DEFAULT_INVOICE, billToName: "Seeded Co" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );
    useGuestStore.setState({ invoice: DEFAULT_INVOICE, updatedAt: null });

    const { invoice, updatedAt } = useGuestStore.getState();
    expect(invoice).toEqual(DEFAULT_INVOICE);
    expect(updatedAt).toBeNull();
    expect(invoice.billToName).not.toBe("Seeded Co");
  });

  it("rehydrate() loads the persisted invoice on the client", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        invoice: { ...DEFAULT_INVOICE, billToName: "Seeded Co" },
        updatedAt: "2026-01-01T00:00:00.000Z",
      }),
    );

    useGuestStore.getState().rehydrate();

    const { invoice, updatedAt } = useGuestStore.getState();
    expect(invoice.billToName).toBe("Seeded Co");
    expect(updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("rehydrate() leaves defaults when storage is empty", () => {
    useGuestStore.getState().rehydrate();
    const { invoice, updatedAt } = useGuestStore.getState();
    expect(invoice).toEqual(DEFAULT_INVOICE);
    expect(updatedAt).toBeNull();
  });
});
