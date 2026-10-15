"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { LockIcon } from "@/components/icons";
import { TEMPLATE_CATALOG, type TemplateMeta } from "@/lib/templates";
import { cn } from "@/lib/utils";

type Filter = "all" | "free" | "pro" | "gst";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "pro", label: "Pro" },
  { id: "gst", label: "GST" },
];

function matches(t: TemplateMeta, f: Filter) {
  if (f === "free") return t.isFree;
  if (f === "pro") return !t.isFree;
  if (f === "gst") return /gst/i.test(`${t.id} ${t.name} ${t.tagline}`);
  return true;
}

export function TemplatesGrid({
  templates = TEMPLATE_CATALOG,
  dark = true,
}: {
  templates?: TemplateMeta[];
  dark?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(() => templates.filter((t) => matches(t, filter)), [templates, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter templates">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === f.id
                ? "border-[#D9F452] bg-[#D9F452] text-[#101210]"
                : dark
                  ? "border-white/15 text-white/70 hover:border-[#D9F452]/60 hover:text-[#D9F452]"
                  : "border-[#E7E2D8] text-[#6B675E] hover:border-[#0C6B4F] hover:text-[#0C6B4F]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: (i % 4) * 0.07, duration: 0.45 }}
            whileHover={{ y: -6 }}
            className={cn(
              "group flex flex-col rounded-2xl border p-5 transition-shadow",
              t.isFree
                ? "border-[#E7E2D8] bg-[#FFFDF8] text-[#141412] hover:shadow-[0_0_36px_-8px_#D9F45299]"
                : "border-white/10 bg-white/[0.04] text-[#F7F5F0] hover:border-[#D9F452]/60 hover:shadow-[0_0_32px_-8px_#D9F45266]",
            )}
          >
            <div
              className={cn(
                "relative h-28 overflow-hidden rounded-xl border",
                t.isFree ? "border-[#E7E2D8]" : "border-white/10",
              )}
              style={{
                background: `linear-gradient(135deg, ${t.accent}26 0%, ${t.accent}0d 60%, transparent 100%)`,
              }}
              aria-hidden
            >
              <div className="absolute inset-0 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-1/3 rounded-full" style={{ backgroundColor: t.accent }} />
                  <div
                    className="h-4 w-12 rounded-full border text-[8px] font-bold"
                    style={{ borderColor: `${t.accent}66`, color: t.accent }}
                  />
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className={cn("h-2 w-3/4 rounded", t.isFree ? "bg-[#141412]/10" : "bg-white/20")} />
                  <div className="flex gap-1.5">
                    <div className={cn("h-2 w-1/4 rounded", t.isFree ? "bg-[#141412]/10" : "bg-white/20")} />
                    <div className="h-2 w-1/3 rounded" style={{ backgroundColor: `${t.accent}55` }} />
                    <div className={cn("h-2 w-1/5 rounded", t.isFree ? "bg-[#141412]/10" : "bg-white/20")} />
                  </div>
                  <div className={cn("h-2 w-2/3 rounded", t.isFree ? "bg-[#141412]/10" : "bg-white/20")} />
                </div>
                <div
                  className="absolute right-3 bottom-2 h-5 w-16 rounded-md"
                  style={{ backgroundColor: `${t.accent}33` }}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {t.isFree ? (
                <span className="rounded-full bg-[#D9F452] px-2.5 py-0.5 text-xs font-bold text-[#101210]">
                  FREE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-[#D9F452]">
                  <LockIcon size={12} aria-hidden />
                  PRO
                </span>
              )}
              <h3 className="text-sm font-semibold">{t.name}</h3>
            </div>
            <p className={cn("mt-1.5 flex-1 text-sm", t.isFree ? "text-[#6B675E]" : "text-white/55")}>
              {t.tagline}
            </p>
            <a
              href={`/create/invoice?template=${t.id}`}
              className={cn(
                "mt-4 inline-flex w-full items-center justify-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                t.isFree
                  ? "border-[#0C6B4F]/25 text-[#0C6B4F] hover:border-[#0C6B4F] hover:bg-[#0C6B4F] hover:text-white"
                  : "border-white/15 hover:border-[#D9F452] hover:text-[#D9F452]",
              )}
            >
              <span>Use template</span>
              <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.article>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={cn("mt-8 text-center text-sm", dark ? "text-white/55" : "text-[#6B675E]")}>
          No templates match this filter yet.
        </p>
      ) : null}
    </div>
  );
}
