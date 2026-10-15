import type { Metadata } from "next";
import { LockIcon } from "@/components/icons";

import { buttonVariants } from "@/components/ui/button";
import { FREE_COUNT, TEMPLATE_CATALOG } from "@/lib/templates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse all 8 SmartBillr invoice templates — 2 free forever, plus premium designs including a GST tax invoice for India.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="paper-texture mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <h1
          className="text-center text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Invoice <em className="text-[#0C6B4F]">templates</em>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          {FREE_COUNT} free forever. Upgrade for the full premium collection.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATE_CATALOG.map((t) => (
            <article
              key={t.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div
                className="h-28 rounded-xl border border-border"
                style={{ background: `linear-gradient(135deg, ${t.accent}26, ${t.accent}08)` }}
                aria-hidden
              >
                <div className="space-y-1.5 p-4">
                  <div className="h-3 w-2/3 rounded" style={{ backgroundColor: t.accent }} />
                  <div className="h-2 w-1/2 rounded bg-muted" />
                  <div className="h-2 w-3/4 rounded bg-muted" />
                  <div className="h-2 w-2/3 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {t.isFree ? (
                  <span className="rounded-full bg-[#D9F452] px-2.5 py-0.5 text-xs font-bold text-[#101210]">
                    FREE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0C6B4F]/10 px-2.5 py-0.5 text-xs font-bold text-[#0C6B4F]">
                    <LockIcon size={12} aria-hidden />
                    PRO
                  </span>
                )}
                <h2 className="text-sm font-semibold">{t.name}</h2>
              </div>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.tagline}</p>
              <a
                href={`/create/invoice?template=${t.id}`}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}
              >
                {t.isFree ? "Use Template" : "Preview"}
              </a>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
