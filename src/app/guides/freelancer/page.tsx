import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Freelancer Invoicing Tips",
  description: "Get paid faster: payment terms, late fees, UPI details, and follow-up scripts for Indian freelancers.",
};

export default function FreelancerGuidePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Freelancer tips to get <em className="text-[#0C6B4F]">paid faster</em>
        </h1>
        <section className="mt-8 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Structure every invoice to convert</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Quote Net-7 or Net-14 terms on every bill — vague &quot;pay soon&quot; gets ignored. Break work into named line items with quantities and rates so clients see value, not a lump sum to negotiate. Add your UPI ID and bank details in the footer, set a due date (not just an issue date), and send the PDF on WhatsApp the same day you finish work. Polite nudge scripts work: day 3 &quot;quick check&quot;, day 7 with a fresh PDF attached, day 14 with a 1.5% late fee noted upfront in your terms.</p>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Look premium, charge premium</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">A clean template with your logo, consistent INV-2026-0001 numbering, and a thank-you note signals you are a business, not a hobbyist. Ask for 30–50% advance on projects above ₹25,000, keep one invoice per milestone, and reconcile monthly. SmartBillr saves your business defaults so repeat bills take seconds.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Send a beautiful invoice today</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create an invoice</a>
        </div>
      </main>
    </div>
  );
}
