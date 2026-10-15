import type { Metadata } from "next";
import { CheckIcon } from "@/components/icons";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SmartBillr pricing: Free forever for basics (₹0) or Pro with all 8 templates, no watermark, custom logo, and GST invoices (₹999 lifetime or ₹199/mo).",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="paper-texture mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <h1
          className="text-center text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Simple, <em className="text-[#0C6B4F]">honest</em> pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Start free. Upgrade only when premium templates pay for themselves.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-border bg-[#FFFDF8] p-8 shadow-sm">
            <h2 className="text-lg font-semibold">Free</h2>
            <p className="mt-2 font-mono text-4xl font-extrabold">
              ₹0
              <span className="font-sans text-base font-normal text-muted-foreground"> forever</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#0C6B4F]" aria-hidden />2 free templates
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#0C6B4F]" aria-hidden />Unlimited invoices
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#0C6B4F]" aria-hidden />PDF downloads with watermark
              </li>
            </ul>
            <a
              href="/create/invoice"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-8 w-full")}
            >
              Start Free
            </a>
          </article>
          <article className="relative flex flex-col rounded-3xl bg-[#0C6B4F] p-8 text-white shadow-lg">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#D9F452] px-4 py-1 text-xs font-bold whitespace-nowrap text-[#101210]">
              MOST POPULAR
            </span>
            <h2 className="text-lg font-semibold">Pro</h2>
            <p className="mt-2 font-mono text-4xl font-extrabold">
              ₹999
              <span className="font-sans text-base font-normal text-white/70">
                {" "}lifetime or ₹199/mo
              </span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#D9F452]" aria-hidden />All 8 templates
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#D9F452]" aria-hidden />No watermark
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#D9F452]" aria-hidden />Custom logo
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={16} className="text-[#D9F452]" aria-hidden />GST invoice template
              </li>
            </ul>
            <a
              href="/create/invoice"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-8 w-full bg-[#D9F452] font-bold text-[#101210] hover:bg-[#c8ec2e]",
              )}
            >
              Go Pro
            </a>
          </article>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Dodo checkout coming in Step 5 — buttons currently link /create/invoice.
        </p>
      </main>
    </div>
  );
}
