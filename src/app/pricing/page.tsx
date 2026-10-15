import type { Metadata } from "next";

import { BackButton } from "@/components/BackButton";
import { PricingCards } from "@/components/PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SmartBillr pricing: Free forever for basics (₹0) or Pro with all 8 templates, no watermark, custom logo, and GST invoices (₹999 lifetime or ₹199/mo).",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="paper-texture mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex items-center">
          <BackButton href="/" />
        </div>
        <h1
          className="text-center text-5xl tracking-tight"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Simple, <em className="text-[#0C6B4F]">honest</em> pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Start free. Upgrade only when premium templates pay for themselves.
        </p>
        <div className="mt-10">
          <PricingCards freeHref="/create/invoice" showDodoNote />
        </div>
      </main>
    </div>
  );
}
