"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { cn } from "../../lib/utils";

export type SelectOption = {
  value: string;
  label: string;
  locked?: boolean;
};

type CustomSelectProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  onLocked?: (option: SelectOption) => void;
};

export function CustomSelect({
  id,
  label,
  value,
  onChange,
  options,
  ariaLabel,
  onLocked,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const buttonId = id ?? `custom-select-${generatedId}`;
  const listId = `${buttonId}-listbox`;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <span id={`${buttonId}-label`} className="sr-only">
          {label}
        </span>
      ) : null}
      <button
        type="button"
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? label}
        aria-labelledby={label ? `${buttonId}-label` : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E7E2D8] bg-[#FFFDF8] px-3 py-2 text-left text-sm text-[#141412] shadow-[inset_0_1px_2px_rgba(20,20,18,0.04)] transition outline-none focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/25"
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          {selected?.locked ? (
            <Lock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
          ) : null}
          <span className="truncate">{selected?.label ?? "Select…"}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "h-4 w-4 shrink-0 text-[#0C6B4F] transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default bg-transparent"
          />
          <div
            role="listbox"
            id={listId}
            aria-label={ariaLabel ?? label}
            className="absolute top-full right-0 left-0 z-40 mt-2 animate-[menu-pop_.14s_ease-out] rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(20,20,18,0.45)] backdrop-blur"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    if (opt.locked) {
                      onLocked?.(opt);
                      return;
                    }
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-xs font-semibold transition",
                    isSelected
                      ? "bg-[#0C6B4F]/10 text-[#0C6B4F]"
                      : "text-stone-700 hover:bg-[#0C6B4F]/5 hover:text-[#0C6B4F]",
                  )}
                >
                  {opt.locked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden />
                  ) : (
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      {isSelected ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {opt.locked ? (
                    <span className="ml-auto rounded-md border border-[#E7E2D8] bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-stone-400">
                      PRO
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
