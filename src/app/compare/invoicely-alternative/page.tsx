import type { Metadata } from "next";
import { BackButton } from "@/components/BackButton";

export const metadata: Metadata = {
  title: "SmartBillr vs Invoicely",
  description: "Honest SmartBillr vs Invoicely comparison for Indian freelancers: GST, pricing, templates, signup.",
};

const ROWS: [string, string, string][] = [
  ["GST-ready (GSTIN, CGST/SGST, HSN)", "Yes — dedicated GST template", "Generic tax fields"],
  ["Free plan", "2 templates, unlimited, no signup", "Limited free tier"],
  ["Signup to start", "No — guest mode", "Account required"],
  ["Templates", "8 designer, India-styled", "Broad but generic set"],
  ["Pro pricing", "₹999 lifetime / ₹199-mo", "USD subscription"],
  ["PDF download", "One click, watermark-free Pro", "Yes, plan-dependent"],
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#141412]">
      <main className="paper-texture mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <BackButton href="/" />
        <h1 className="mt-6 text-5xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          SmartBillr vs <em className="text-[#0C6B4F]">Invoicely</em>
        </h1>
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-[#101210] text-[#D9F452]"><th className="px-4 py-3">Feature</th><th className="px-4 py-3">SmartBillr</th><th className="px-4 py-3">Invoicely</th></tr></thead>
            <tbody>{ROWS.map(([f, s, iv]) => (<tr key={f} className="border-t border-[#E7E2D8]"><td className="px-4 py-3 font-semibold">{f}</td><td className="px-4 py-3 text-[#0C6B4F]">{s}</td><td className="px-4 py-3 text-[#6B675E]">{iv}</td></tr>))}</tbody>
          </table>
        </section>
        <section className="mt-4 rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6">
          <h2 className="text-xl font-bold">Our honest take</h2>
          <p className="mt-2 text-sm leading-6 text-[#6B675E]">Invoicely is a solid global tool. Choose SmartBillr if you bill in India: GST splits, HSN, UPI-friendly totals, and lifetime pricing in rupees — with guest-mode invoices in two minutes.</p>
        </section>
        <div className="mt-8 rounded-[2rem] bg-[#0C6B4F] p-8 text-center text-white">
          <p className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Try the India-first alternative</p>
          <a href="/create/invoice" className="mt-4 inline-block rounded-full bg-[#D9F452] px-6 py-2.5 text-sm font-bold text-[#101210]">Create an invoice</a>
        </div>
      </main>
    </div>
  );
}
