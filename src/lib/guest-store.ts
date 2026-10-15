"use client";

import { create } from "zustand";
import {
  DEFAULT_INVOICE,
  newItemId,
  type InvoiceData,
  type InvoiceItem,
} from "./invoice";

const STORAGE_KEY = "smartbillr_guest_invoice";

type GuestState = {
  invoice: InvoiceData;
  updatedAt: string | null;
  setInvoice: (patch: Partial<InvoiceData>) => void;
  setItem: (items: InvoiceItem[]) => void;
  updateItem: (id: string, patch: Partial<InvoiceItem>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  reset: () => void;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadInitial(): { invoice: InvoiceData; updatedAt: string | null } {
  if (!isBrowser()) {
    return { invoice: DEFAULT_INVOICE, updatedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { invoice: DEFAULT_INVOICE, updatedAt: null };
    const parsed = JSON.parse(raw) as {
      invoice?: InvoiceData;
      updatedAt?: string | null;
    };
    if (!parsed.invoice || !Array.isArray(parsed.invoice.items)) {
      return { invoice: DEFAULT_INVOICE, updatedAt: null };
    }
    return {
      invoice: { ...DEFAULT_INVOICE, ...parsed.invoice },
      updatedAt: parsed.updatedAt ?? null,
    };
  } catch {
    return { invoice: DEFAULT_INVOICE, updatedAt: null };
  }
}

function persist(invoice: InvoiceData, updatedAt: string | null): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ invoice, updatedAt }));
  } catch {
    // storage full / private mode — ignore, app still works in-memory
  }
}

const initial = loadInitial();

export const useGuestStore = create<GuestState>()((set) => ({
  invoice: initial.invoice,
  updatedAt: initial.updatedAt,

  setInvoice: (patch) =>
    set((s) => ({
      invoice: { ...s.invoice, ...patch },
      updatedAt: new Date().toISOString(),
    })),

  setItem: (items) =>
    set((s) => ({
      invoice: { ...s.invoice, items },
      updatedAt: new Date().toISOString(),
    })),

  updateItem: (id, patch) =>
    set((s) => ({
      invoice: {
        ...s.invoice,
        items: s.invoice.items.map((it) =>
          it.id === id ? { ...it, ...patch } : it,
        ),
      },
      updatedAt: new Date().toISOString(),
    })),

  addItem: () =>
    set((s) => ({
      invoice: {
        ...s.invoice,
        items: [
          ...s.invoice.items,
          {
            id: newItemId(),
            desc: "New item",
            qty: 1,
            rate: 0,
            taxPct: 18,
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    })),

  removeItem: (id) =>
    set((s) => ({
      invoice: {
        ...s.invoice,
        items: s.invoice.items.filter((it) => it.id !== id),
      },
      updatedAt: new Date().toISOString(),
    })),

  reset: () =>
    set(() => ({
      invoice: DEFAULT_INVOICE,
      updatedAt: new Date().toISOString(),
    })),
}));

// Persist on every set via subscribe (no login required)
if (isBrowser()) {
  persist(useGuestStore.getState().invoice, useGuestStore.getState().updatedAt);
  useGuestStore.subscribe((s) => {
    persist(s.invoice, s.updatedAt);
  });
}

export { STORAGE_KEY };
