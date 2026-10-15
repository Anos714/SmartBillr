import { describe, expect, it, beforeEach } from "vitest";
import { DEFAULT_INVOICE } from "./invoice";
import {
  deleteInvoice,
  duplicateInvoice,
  listInvoices,
  saveInvoice,
  updateStatus,
  LIBRARY_KEY,
} from "./library";

beforeEach(() => {
  localStorage.clear();
});

describe("invoice library", () => {
  it("saves an invoice with computed total and default draft status", () => {
    const saved = saveInvoice(DEFAULT_INVOICE);
    expect(saved.id).toBeTruthy();
    expect(saved.status).toBe("draft");
    expect(saved.total).toBeGreaterThan(0);
    expect(saved.invoice.billToName).toBe(DEFAULT_INVOICE.billToName);
    const raw = localStorage.getItem(LIBRARY_KEY);
    expect(raw).toContain(saved.id);
  });

  it("lists saved invoices", () => {
    saveInvoice(DEFAULT_INVOICE);
    saveInvoice({ ...DEFAULT_INVOICE, billToName: "Second Co" }, "paid");
    expect(listInvoices()).toHaveLength(2);
  });

  it("updates status", () => {
    const saved = saveInvoice(DEFAULT_INVOICE);
    expect(updateStatus(saved.id, "paid")).toBe(true);
    const found = listInvoices().find((e) => e.id === saved.id);
    expect(found?.status).toBe("paid");
  });

  it("returns false when updating a missing id", () => {
    expect(updateStatus("missing-id", "paid")).toBe(false);
  });

  it("duplicates an invoice with a new id", () => {
    const saved = saveInvoice(DEFAULT_INVOICE, "pending");
    const copy = duplicateInvoice(saved.id);
    expect(copy).not.toBeNull();
    expect(copy!.id).not.toBe(saved.id);
    expect(copy!.invoice.billToName).toBe(saved.invoice.billToName);
    expect(listInvoices()).toHaveLength(2);
  });

  it("deletes an invoice", () => {
    const saved = saveInvoice(DEFAULT_INVOICE);
    expect(deleteInvoice(saved.id)).toBe(true);
    expect(listInvoices()).toHaveLength(0);
    expect(deleteInvoice(saved.id)).toBe(false);
  });

  it("clears a stale migrated flag when a new guest invoice is saved", () => {
    localStorage.setItem("smartbillr_migrated", "2026-01-01T00:00:00.000Z");
    saveInvoice(DEFAULT_INVOICE);
    expect(localStorage.getItem("smartbillr_migrated")).toBeNull();
  });

  it("clears legacy non-timestamp migrated flags on new save", () => {
    localStorage.setItem("smartbillr_migrated", "1");
    saveInvoice(DEFAULT_INVOICE);
    expect(localStorage.getItem("smartbillr_migrated")).toBeNull();
  });
});
