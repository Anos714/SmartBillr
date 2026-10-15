import type { Metadata } from "next";

import { BackButton } from "@/components/BackButton";
import { TemplatesGrid } from "@/components/TemplatesGrid";
import { FREE_COUNT } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Browse all 8 SmartBillr invoice templates — 2 free forever, plus premium designs including a GST tax invoice for India.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#101210] text-[#F7F5F0]">
      <main className="paper-texture mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex items-center">
          <BackButton href="/" className="border-white/15 text-white/80" />
        </div>
        <h1
          className="text-center text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Invoice <em className="text-[#D9F452]">templates</em>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-white/60">
          {FREE_COUNT} free forever. Upgrade for the full premium collection.
        </p>
        <div className="mt-10">
          <TemplatesGrid dark />
        </div>
      </main>
    </div>
  );
}
