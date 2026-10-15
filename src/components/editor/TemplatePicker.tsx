"use client";

import { Lock } from "lucide-react";
import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { cn } from "@/lib/utils";

type Props = {
  selectedId: string;
  isPro?: boolean;
  onSelect: (template: TemplateMeta) => void;
  onLocked: (template: TemplateMeta) => void;
};

export function TemplatePicker({ selectedId, isPro = false, onSelect, onLocked }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATE_CATALOG.map((t) => {
        const locked = !t.isFree && !isPro;
        const selected = t.id === selectedId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => (locked ? onLocked(t) : onSelect(t))}
            className={cn(
              "relative rounded-xl border p-3 text-left transition",
              selected
                ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                : "border-zinc-200 hover:border-zinc-400",
            )}
          >
            <div
              className="h-16 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${t.accent} 0%, ${t.accent}55 60%, #fafafa 100%)`,
              }}
            />
            <p className="mt-2 text-xs font-semibold leading-tight">{t.name}</p>
            <div className="mt-1">
              {t.isFree ? (
                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Free
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  <Lock className="h-3 w-3" /> Pro
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
