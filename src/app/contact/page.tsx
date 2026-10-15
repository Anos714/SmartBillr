import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SmartBillr — email us or send a message. We reply within 2 business days.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Talk to <em className="text-[#0C6B4F]">us</em>
        </h1>
        <section className="mt-8 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Email us directly</h2>
          <p className="mt-2 text-sm text-[#6B675E]">Fastest way to reach a human.</p>
          <a href="mailto:hello@smartbillr.in" className="mt-4 inline-block rounded-full bg-[#0C6B4F] px-6 py-2.5 text-sm font-bold text-white">hello@smartbillr.in</a>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Send a message</h2>
          <p className="mt-1 text-xs text-[#6B675E]">Demo form — not wired up yet, please email us instead.</p>
          <form className="mt-4 space-y-3">
            <input placeholder="Your name" aria-label="Your name" className="w-full rounded-lg border border-[#E7E2D8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/20" />
            <input placeholder="Email" aria-label="Email" className="w-full rounded-lg border border-[#E7E2D8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/20" />
            <textarea rows={3} placeholder="How can we help?" aria-label="Message" className="w-full rounded-lg border border-[#E7E2D8] bg-white px-3 py-2 text-sm outline-none focus:border-[#0C6B4F] focus:ring-2 focus:ring-[#0C6B4F]/20" />
            <button type="submit" className="rounded-full bg-[#101210] px-6 py-2.5 text-sm font-bold text-[#D9F452]">Send (demo)</button>
          </form>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Or just start invoicing</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create an invoice</a>
        </div>
      </main>
    </div>
  );
}
