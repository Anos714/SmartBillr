import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "About",
  description: "About SmartBillr — beautiful GST-ready invoices for Indian freelancers and small businesses.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Invoices clients <em className="text-[#0C6B4F]">love</em> to pay
        </h1>
        <p className="mt-4 text-[#6B675E]">SmartBillr is a free-first invoice generator built for Indian freelancers.</p>
        <section className="mt-10 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Why we exist</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Billing tools are either ugly spreadsheets or bloated accounting suites. We make one beautiful thing: a GST-ready invoice you can send in two minutes, with no signup for basics.</p>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">How we work</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Free forever for basics: 2 templates, unlimited invoices, PDF in one click. Pro unlocks all 8 templates, watermark-free PDFs, custom logo, and the GST tax invoice.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Try SmartBillr free today</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create an invoice</a>
        </div>
      </main>
    </div>
  );
}
