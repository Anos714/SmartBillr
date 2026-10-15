import { describe, expect, it } from "vitest";

import { DEFAULT_INVOICE, type InvoiceData } from "./invoice";
import type { SavedInvoice } from "./library";
import {
  currencies,
  isOverdue,
  monthlySeries,
  overview,
  paidAtOf,
  topClients,
} from "./stats";

let seq = 0;

function makeEntry(over: Partial<SavedInvoice> = {}): SavedInvoice {
  seq += 1;
  return {
    id: `id-${seq}`,
    savedAt: "2026-06-15T10:00:00.000Z",
    invoice: {
      ...DEFAULT_INVOICE,
      billToName: "Acme",
      billToAddress: "1 Road",
      issueDate: "2026-06-10",
      dueDate: "2026-06-24",
      currency: "INR",
    } as InvoiceData,
    status: "pending",
    total: 100,
    ...over,
  };
}

function withInvoice(
  e: SavedInvoice,
  inv: Partial<InvoiceData>,
): SavedInvoice {
  return { ...e, invoice: { ...e.invoice, ...inv } as InvoiceData };
}

describe("stats", () => {
  it("separates currencies — never mixes INR and USD", () => {
    const rows = [
      withInvoice(makeEntry({ status: "paid", total: 100 }), {
        currency: "INR",
      }),
      withInvoice(makeEntry({ status: "paid", total: 200 }), {
        currency: "USD",
      }),
      withInvoice(makeEntry({ status: "pending", total: 50 }), {
        currency: "INR",
      }),
    ];
    const inr = overview(rows, "INR");
    const usd = overview(rows, "USD");
    expect(inr.collected).toBe(100);
    expect(inr.collectedCount).toBe(1);
    expect(inr.outstanding).toBe(50);
    expect(usd.collected).toBe(200);
    expect(usd.outstanding).toBe(0);
    expect(usd.outstandingCount).toBe(0);
  });

  it("marks past-due unpaid invoices overdue, but not those due today/future", () => {
    const now = new Date(2026, 5, 15); // Jun 15 2026 local
    const past = withInvoice(makeEntry({ status: "pending" }), {
      dueDate: "2026-06-14",
    });
    const today = withInvoice(makeEntry({ status: "pending" }), {
      dueDate: "2026-06-15",
    });
    const future = withInvoice(makeEntry({ status: "pending" }), {
      dueDate: "2026-06-16",
    });
    expect(isOverdue(past, now)).toBe(true);
    expect(isOverdue(today, now)).toBe(false);
    expect(isOverdue(future, now)).toBe(false);
  });

  it("never flags paid invoices overdue even when past due", () => {
    const now = new Date(2026, 5, 15);
    const paid = withInvoice(makeEntry({ status: "paid" }), {
      dueDate: "2026-01-01",
    });
    expect(isOverdue(paid, now)).toBe(false);
    const o = overview([paid], "INR", now);
    expect(o.overdueCount).toBe(0);
    expect(o.overdue).toBe(0);
    expect(o.collectedCount).toBe(1);
  });

  it("counts draft + pending + stored-overdue as outstanding", () => {
    const now = new Date(2026, 5, 15);
    const rows = [
      withInvoice(makeEntry({ status: "draft", total: 10 }), {
        dueDate: "2026-12-31",
      }),
      withInvoice(makeEntry({ status: "pending", total: 20 }), {
        dueDate: "2026-12-31",
      }),
      withInvoice(makeEntry({ status: "overdue", total: 30 }), {
        dueDate: "2026-12-31",
      }),
    ];
    const o = overview(rows, "INR", now);
    expect(o.outstanding).toBe(60);
    expect(o.outstandingCount).toBe(3);
    // stored overdue status counts even with a future due date
    expect(o.overdueCount).toBe(1);
    expect(o.overdue).toBe(30);
  });

  it("buckets billed by issue month and collected by paid month (paid only)", () => {
    const now = new Date(2026, 5, 20); // June
    const rows = [
      withInvoice(
        makeEntry({
          status: "paid",
          total: 100,
          savedAt: "2026-06-05T10:00:00.000Z",
          paidAt: "2026-06-05T10:00:00.000Z",
        }),
        { issueDate: "2026-05-10", currency: "INR" },
      ),
      withInvoice(makeEntry({ status: "pending", total: 40 }), {
        issueDate: "2026-06-11",
        currency: "INR",
      }),
    ];
    const s = monthlySeries(rows, 6, "INR", now);
    expect(s).toHaveLength(6);
    const may = s[s.length - 2]!;
    const jun = s[s.length - 1]!;
    expect(may.billed).toBe(100);
    expect(may.collected).toBe(0);
    expect(jun.billed).toBe(40);
    expect(jun.collected).toBe(100);
  });

  it("supports 12-month windows and filters currency", () => {
    const now = new Date(2026, 5, 20);
    const rows = [
      withInvoice(makeEntry({ status: "pending", total: 25 }), {
        issueDate: "2026-01-05",
        currency: "USD",
      }),
    ];
    const s12 = monthlySeries(rows, 12, "USD", now);
    expect(s12).toHaveLength(12);
    // 12-month window ending Jun 2026 starts Jul 2025 → Jan 2026 is index 6
    expect(s12[6]!.billed).toBe(25);
    expect(s12.reduce((a, p) => a + p.billed, 0)).toBe(25);
    const inr = monthlySeries(rows, 12, "INR", now);
    expect(inr.every((p) => p.billed === 0 && p.collected === 0)).toBe(true);
  });

  it("groups top clients by normalized name+address and caps at 5", () => {
    const rows: SavedInvoice[] = [];
    for (let i = 0; i < 7; i++) {
      rows.push(
        withInvoice(
          makeEntry({
            status: i % 2 === 0 ? "paid" : "pending",
            total: 10 * (i + 1),
          }),
          { billToName: `Client ${i}`, billToAddress: `${i} Street` },
        ),
      );
    }
    // case/whitespace variants merge into one client
    rows.push(
      withInvoice(makeEntry({ status: "paid", total: 5 }), {
        billToName: "  ACME ",
        billToAddress: "1 Road",
      }),
    );
    rows.push(
      withInvoice(makeEntry({ status: "pending", total: 7 }), {
        billToName: "acme",
        billToAddress: "1  road ",
      }),
    );
    const top = topClients(rows, "INR", 5);
    expect(top).toHaveLength(5);
    expect(top[0]!.billed).toBeGreaterThanOrEqual(top[4]!.billed);
    const acme = top.find((c) => c.name.trim().toLowerCase() === "acme");
    // merged only if within top-5 by billed; check via unlimited query
    const all = topClients(rows, "INR", 50);
    const acmeAll = all.find((c) => c.name.trim().toLowerCase() === "acme");
    expect(acmeAll).toBeDefined();
    expect(acmeAll!.invoices).toBe(2);
    expect(acmeAll!.billed).toBe(12);
    expect(acmeAll!.collected).toBe(5);
    expect(acmeAll!.outstanding).toBe(7);
    // the merged small client is cut by the top-5 cap (70/60/50/40/30 rank above 12)
    expect(acme).toBeUndefined();
  });

  it("labels missing client names as Unknown client", () => {
    const rows = [
      withInvoice(makeEntry({ status: "pending", total: 9 }), {
        billToName: "   ",
        billToAddress: "",
      }),
    ];
    const top = topClients(rows, "INR", 5);
    expect(top[0]!.name).toBe("Unknown client");
    expect(top[0]!.outstanding).toBe(9);
  });

  it("lists distinct currencies sorted", () => {
    const rows = [
      withInvoice(makeEntry(), { currency: "USD" }),
      withInvoice(makeEntry(), { currency: "INR" }),
      withInvoice(makeEntry(), { currency: "EUR" }),
      withInvoice(makeEntry(), { currency: "INR" }),
    ];
    expect(currencies(rows)).toEqual(["EUR", "INR", "USD"]);
    expect(currencies([])).toEqual([]);
  });

  it("rounds money to 2dp", () => {
    const rows = [
      makeEntry({ status: "paid", total: 10.005 }),
      makeEntry({ status: "paid", total: 0.005 }),
    ];
    const o = overview(rows, "INR");
    expect(o.collected).toBe(10.01);
  });

  it("paidAtOf prefers paidAt, falls back to savedAt, null when unpaid", () => {
    const paid = makeEntry({
      status: "paid",
      savedAt: "2026-06-01T00:00:00.000Z",
      paidAt: "2026-06-09T00:00:00.000Z",
    });
    const legacyPaid = makeEntry({
      status: "paid",
      savedAt: "2026-06-01T00:00:00.000Z",
    });
    const unpaid = makeEntry({ status: "pending" });
    expect(paidAtOf(paid)).toBe("2026-06-09T00:00:00.000Z");
    expect(paidAtOf(legacyPaid)).toBe("2026-06-01T00:00:00.000Z");
    expect(paidAtOf(unpaid)).toBeNull();
  });
});
