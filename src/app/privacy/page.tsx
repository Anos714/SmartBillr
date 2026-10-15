import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Privacy",
  description: "SmartBillr privacy policy — your invoices render in your browser and we never sell your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Privacy <em className="text-[#0C6B4F]">policy</em>
        </h1>
        <p className="mt-4 text-sm text-[#6B675E]">Last updated: January 2026. Plain-English summary of how we handle data.</p>
        <section className="mt-8 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">What we store</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Guest invoices never touch our servers — they render locally in your browser. If you sign in and save, we store your business profile, clients, and invoice history so you can reuse them.</p>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">What we never do</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">We never sell your data, never show ads inside your invoices, and never share client emails. Delete your account anytime by emailing hello@smartbillr.in and we remove saved records within 30 days.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Private by design</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create an invoice</a>
        </div>
      </main>
    </div>
  );
}
