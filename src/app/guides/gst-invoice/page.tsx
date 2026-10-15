import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "GST Invoice Guide India",
  description: "How to make a GST-compliant invoice: GSTIN, CGST/SGST vs IGST, HSN codes, and mandatory fields.",
};

export default function GstGuidePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          GST invoice guide <em className="text-[#0C6B4F]">for India</em>
        </h1>
        <section className="mt-8 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">What a GST invoice must show</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Every GST tax invoice needs your business name, address, and 15-digit GSTIN, plus a unique invoice number, date, and the customer&apos;s billing details with their GSTIN if registered. Add HSN codes for goods or SAC codes for services — 4 digits up to ₹5cr turnover, 6 above. Show taxable value per line, then tax: CGST + SGST for in-state sales, IGST for inter-state. Mention place of supply, reverse-charge applicability, and sign it. SmartBillr&apos;s GST template lays all of this out automatically so you never miss a field.</p>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">CGST, SGST, IGST & HSN in 60 seconds</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Selling within your state? Split GST equally: 9% CGST + 9% SGST on an 18% slab. Selling across states? Charge 18% IGST instead. Always put HSN next to each item — e.g. 9983 for design services — so GSTR-1 filing matches your books. Keep serial numbers continuous across the financial year, store PDFs for 6 years, and issue credit notes (not edits) when a billed amount changes after filing.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Make a GST invoice in 2 minutes</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create GST invoice</a>
        </div>
      </main>
    </div>
  );
}
