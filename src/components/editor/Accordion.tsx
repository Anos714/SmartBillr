"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionProps = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function Accordion({
  id,
  title,
  subtitle,
  icon,
  open,
  onToggle,
  children,
}: AccordionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#0C6B4F]/[.03]"
        >
          {icon ? (
            <span className={cn("shrink-0", open ? "text-[#0C6B4F]" : "text-stone-400")}>
              {icon}
            </span>
          ) : null}
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm font-bold",
                open ? "text-[#0C6B4F]" : "text-stone-900",
              )}
            >
              {title}
            </span>
            {subtitle ? (
              <span className="block truncate text-xs text-stone-500">{subtitle}</span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200",
              open && "rotate-180 text-[#0C6B4F]",
            )}
          />
        </button>
      </h2>
      {open ? (
        <div id={`${id}-panel`} className="border-t border-[#E7E2D8] p-4 sm:p-5">
          {children}
        </div>
      ) : null}
    </section>
  );
}
