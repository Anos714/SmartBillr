"use client";

import { create } from "zustand";
import {
  DEFAULT_INVOICE,
  migrateInvoice,
  newAdjustmentId,
  newItemId,
  type Adjustment,
  type InvoiceData,
  type InvoiceItem,
  type MetaLine,
} from "./invoice";

const STORAGE_KEY = "smartbillr_guest_invoice";
export const DEFAULT_DETAILS_KEY = "smartbillr_default_details";

export type MetaTarget = "companyMeta" | "clientMeta" | "paymentInfo";

type DefaultDetails = {
  fromName?: string;
  fromEmail?: string;
  fromAddress?: string;
  logoUrl?: string;
  gstin?: string;
  companyMeta?: MetaLine[];
  billToName?: string;
  billToEmail?: string;
  billToAddress?: string;
  clientMeta?: MetaLine[];
  paymentInfo?: MetaLine[];
};

type GuestState = {
  invoice: InvoiceData;
  updatedAt: string | null;
  setInvoice: (patch: Partial<InvoiceData>) => void;
  /** Alias for setInvoice (field patch). */
  setField: (patch: Partial<InvoiceData>) => void;
  setItem: (items: InvoiceItem[]) => void;
  updateItem: (id: string, patch: Partial<InvoiceItem>) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  addAdjustment: () => void;
  updateAdjustment: (id: string, patch: Partial<Adjustment>) => void;
  removeAdjustment: (id: string) => void;
  addMeta: (target: MetaTarget) => void;
  updateMeta: (target: MetaTarget, index: number, patch: Partial<MetaLine>) => void;
  removeMeta: (target: MetaTarget, index: number) => void;
  saveAsDefault: () => void;
  loadDefault: () => void;
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
      invoice?: unknown;
      updatedAt?: string | null;
    };
    if (
      !parsed.invoice ||
      typeof parsed.invoice !== "object" ||
      !Array.isArray((parsed.invoice as { items?: unknown }).items)
    ) {
      return { invoice: DEFAULT_INVOICE, updatedAt: null };
    }
    return {
      invoice: migrateInvoice(parsed.invoice),
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

function touch(
  set: (
    fn: (s: { invoice: InvoiceData; updatedAt: string | null }) => Partial<GuestState>,
  ) => void,
  fn: (s: { invoice: InvoiceData }) => InvoiceData,
): void {
  set((s) => ({
    invoice: fn(s),
    updatedAt: new Date().toISOString(),
  }));
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

  setField: (patch) =>
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
            name: "New item",
            description: "",
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

  addAdjustment: () =>
    touch(set, (s) => ({
      ...s.invoice,
      adjustments: [
        ...(s.invoice.adjustments ?? []),
        { id: newAdjustmentId(), label: "Tax", value: 0, type: "percentage" as const },
      ],
    })),

  updateAdjustment: (id, patch) =>
    touch(set, (s) => ({
      ...s.invoice,
      adjustments: (s.invoice.adjustments ?? []).map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    })),

  removeAdjustment: (id) =>
    touch(set, (s) => ({
      ...s.invoice,
      adjustments: (s.invoice.adjustments ?? []).filter((a) => a.id !== id),
    })),

  addMeta: (target) =>
    touch(set, (s) => ({
      ...s.invoice,
      [target]: [...(s.invoice[target] ?? []), { label: "", value: "" }],
    })),

  updateMeta: (target, index, patch) =>
    touch(set, (s) => ({
      ...s.invoice,
      [target]: (s.invoice[target] ?? []).map((row, i) =>
        i === index ? { ...row, ...patch } : row,
      ),
    })),

  removeMeta: (target, index) =>
    touch(set, (s) => ({
      ...s.invoice,
      [target]: (s.invoice[target] ?? []).filter((_, i) => i !== index),
    })),

  saveAsDefault: () =>
    set((s) => {
      if (isBrowser()) {
        try {
          const details: DefaultDetails = {
            fromName: s.invoice.fromName,
            fromEmail: s.invoice.fromEmail,
            fromAddress: s.invoice.fromAddress,
            logoUrl: s.invoice.logoUrl,
            gstin: s.invoice.gstin,
            companyMeta: s.invoice.companyMeta,
            billToName: s.invoice.billToName,
            billToEmail: s.invoice.billToEmail,
            billToAddress: s.invoice.billToAddress,
            clientMeta: s.invoice.clientMeta,
            paymentInfo: s.invoice.paymentInfo,
          };
          localStorage.setItem(DEFAULT_DETAILS_KEY, JSON.stringify(details));
        } catch {
          // ignore
        }
      }
      return { updatedAt: new Date().toISOString() } as Partial<GuestState>;
    }),

  loadDefault: () =>
    set((s) => {
      if (!isBrowser()) return {};
      try {
        const raw = localStorage.getItem(DEFAULT_DETAILS_KEY);
        if (!raw) return {};
        const details = JSON.parse(raw) as DefaultDetails;
        return {
          invoice: { ...s.invoice, ...details },
          updatedAt: new Date().toISOString(),
        };
      } catch {
        return {};
      }
    }),

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
