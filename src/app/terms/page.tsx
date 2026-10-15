import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Terms",
  description: "SmartBillr terms of service — free and Pro plans, fair use, and refunds.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Terms of <em className="text-[#0C6B4F]">service</em>
        </h1>
        <p className="mt-4 text-sm text-[#6B675E]">Last updated: January 2026.</p>
        <section className="mt-8 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Plans & fair use</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Free gives unlimited invoices with a small watermark. Pro (₹999 lifetime or ₹199/mo) unlocks all templates and watermark-free PDFs. One Pro license covers one business; please don&apos;t resell templates.</p>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Refunds & liability</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Lifetime Pro is refundable within 7 days, monthly within 48 hours of charge. SmartBillr provides invoice formatting tools, not tax advice — please confirm GST treatment with your CA.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Simple, honest pricing</p>
          <a href="/pricing" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">See pricing</a>
        </div>
      </main>
    </div>
  );
}
