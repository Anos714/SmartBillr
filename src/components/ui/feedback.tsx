"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/library";

const TOAST_TIMEOUT_MS = 2200;

/**
 * Shared toast state. Keeps the 2200ms auto-dismiss behaviour previously
 * triplicated across the invoices/assets/create-invoice pages.
 */
export function useToast(timeoutMs: number = TOAST_TIMEOUT_MS) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const showToast = useCallback(
    (msg: string) => {
      setToast(msg);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), timeoutMs);
    },
    [timeoutMs],
  );

  return { toast, showToast };
}

/**
 * Shared toast container. Always carries `role="status"` so assistive
 * tech announces transient messages.
 */
export function Toast({
  message,
  className,
}: {
  message: string | null;
  className?: string;
}) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#141412] px-4 py-2 text-sm font-semibold whitespace-nowrap text-white shadow-xl",
        className,
      )}
    >
      {message}
    </div>
  );
}

/**
 * Shared centered empty/error card (previously triplicated across
 * dashboard/invoices with slightly different wrappers).
 */
export function EmptyState({
  icon,
  title,
  copy,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  copy?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-14 text-center",
        className,
      )}
    >
      {icon}
      <h2
        className="mt-5 text-2xl tracking-tight text-[#141412]"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        {title}
      </h2>
      {copy ? (
        <p className="mt-2 text-sm leading-6 text-stone-500">{copy}</p>
      ) : null}
      {action ? <div className="mt-6 flex gap-2">{action}</div> : null}
    </section>
  );
}

const STATUS_PILL: Record<InvoiceStatus, string> = {
  draft: "bg-stone-100 text-stone-600",
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  overdue: "bg-red-100 text-red-700",
};

/** Shared invoice status pill (previously local to the invoices page). */
export function StatusPill({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize",
        STATUS_PILL[status],
      )}
    >
      {status}
    </span>
  );
}
