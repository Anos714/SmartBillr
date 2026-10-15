"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { Wordmark } from "@/components/Brand";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartIcon,
  CheckIcon,
  InvoiceIcon,
  LockIcon,
  PaletteIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TemplatesIcon,
} from "@/components/icons";
import { FREE_COUNT, TEMPLATE_CATALOG } from "@/lib/templates";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Is SmartBillr the best free GST invoice generator for India?",
    a: "Yes — SmartBillr is built for Indian freelancers and small businesses: create GST-ready invoices with GSTIN, CGST/SGST breakdowns, and professional totals in seconds. The free plan includes two beautiful templates with unlimited invoices and no signup, while Pro unlocks a dedicated GST tax invoice template, custom logo, and watermark-free PDFs.",
  },
  {
    q: "Do I need to sign up to create an invoice?",
    a: "No. You can create, customize, and download your first invoice as a guest with zero signup. Signing in is only needed when you want to save clients, templates, and invoice history to your account.",
  },
  {
    q: "Does the free plan add a watermark?",
    a: "Yes, free-plan downloads include a small SmartBillr watermark. Upgrade to Pro for completely watermark-free PDFs, plus your own custom logo on every invoice.",
  },
  {
    q: "What's the difference between Free and Pro?",
    a: "Free gives you 2 templates, unlimited invoices, and PDF downloads with a watermark — forever. Pro unlocks all 8 templates, watermark-free PDFs, a custom logo, and the GST tax invoice template, for ₹999 lifetime or ₹199 per month.",
  },
  {
    q: "Can I download my invoice as a PDF?",
    a: "Yes. Every invoice you create can be downloaded as a print-ready PDF in one click, on both Free and Pro plans. Share it over email or WhatsApp straight from the preview.",
  },
  {
    q: "Is my business data safe and private?",
    a: "Absolutely. Your invoices are created in your browser and only stored when you choose to save them. We never sell your data, and guest invoices leave no trace on our servers.",
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SmartBillr",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Free invoice generator for freelancers and Indian businesses. GST-ready invoices, 2 free templates, no signup needed for basics.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR" },
    { "@type": "Offer", name: "Pro", price: "999", priceCurrency: "INR" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "312",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const FEATURES = [
  {
    icon: PaletteIcon,
    title: "Beautiful by default",
    body: "Eight designer-crafted templates with real typography, spacing, and color — invoices clients actually enjoy opening.",
  },
  {
    icon: InvoiceIcon,
    title: "Free forever basics",
    body: "Two full templates, unlimited invoices, and PDF downloads. No trial, no card, no catch — free means free.",
  },
  {
    icon: ShieldIcon,
    title: "Safe & private",
    body: "Work as a guest without an account. Your data stays yours — nothing stored unless you ask us to.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "My clients started paying faster the week I switched. The GST template alone is worth ten times the Pro price.",
    name: "Priya Sharma",
    role: "Freelance designer, Mumbai",
  },
  {
    quote:
      "Finally, an invoice tool that doesn't look like a spreadsheet from 2004. Created my first bill in under two minutes.",
    name: "Rahul Verma",
    role: "Consultant, Bengaluru",
  },
  {
    quote:
      "No signup, no nonsense. I made a packing slip for my store between orders and it just worked.",
    name: "Anita Desai",
    role: "Etsy seller, Pune",
  },
];

const MARQUEE_ITEMS = [
  "GST-ready",
  "No signup",
  "2 free templates",
  "PDF in one click",
  "UPI-friendly totals",
  "Watermark-free Pro",
  "Made for India",
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
      >
        <span>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0C6B4F] text-xl leading-none text-[#D9F452]"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm leading-6 text-[#6B675E]">{a}</p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#F7F5F0] text-[#141412]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Navbar — floating dark pill */}
      <div className="fixed inset-x-0 top-4 z-50 px-4">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full bg-[#101210] py-2 pr-2 pl-5 text-[#F7F5F0] shadow-xl"
        >
          <a href="#" aria-label="SmartBillr home" className="text-[#F7F5F0]">
            <Wordmark size={28} />
          </a>
          <nav aria-label="Main" className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a href="#features" className="transition-colors hover:text-[#D9F452]">
              Features
            </a>
            <a href="#templates" className="transition-colors hover:text-[#D9F452]">
              Templates
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#D9F452]">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="/create/invoice"
              className="hidden rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:text-white sm:block"
            >
              Sign In
            </a>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/create/invoice"
              className="rounded-full bg-[#D9F452] px-5 py-2.5 text-sm font-semibold text-[#101210]"
            >
              Start Free
            </motion.a>
          </div>
        </motion.header>
      </div>

      <main className="paper-texture relative">
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl overflow-hidden px-4 pt-32 pb-12 text-center sm:px-6 sm:pt-40">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] px-4 py-1.5 text-xs font-medium text-[#6B675E]"
          >
            <SparklesIcon size={14} className="text-[#0C6B4F]" />
            GST-ready for India + Global
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-5xl leading-[1.05] tracking-tight text-balance sm:text-7xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Invoices clients{" "}
            <span className="relative inline-block italic">
              love
              <svg
                viewBox="0 0 220 22"
                aria-hidden
                className="absolute -bottom-2 left-0 w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 16 C 60 6, 160 6, 216 12"
                  fill="none"
                  stroke="#D9F452"
                  strokeWidth="9"
                  strokeLinecap="round"
                  className="animate-draw-stroke"
                />
              </svg>
            </span>{" "}
            to pay
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="mx-auto mt-6 max-w-xl text-lg text-[#6B675E]"
          >
            Free for basics, Pro for premium. Invoices your clients will love to
            pay — in under two minutes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/create/invoice"
              className="inline-flex h-13 items-center gap-2 rounded-full bg-[#0C6B4F] px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#0a5a42]"
            >
              Start Free — No Signup
              <ArrowRightIcon size={18} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="#templates"
              className="inline-flex items-center gap-2 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] px-8 py-3.5 text-base font-semibold transition-colors hover:bg-[#EFE9DC]"
            >
              View Templates
            </motion.a>
          </motion.div>

          {/* Invoice mockup */}
          <motion.div
            initial={{ opacity: 0, y: 48, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div
              className="overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] text-left shadow-2xl"
              role="img"
              aria-label="Preview of a SmartBillr invoice"
            >
              <div className="flex items-center gap-1.5 border-b border-[#E7E2D8] bg-[#EFE9DC] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0C6B4F]/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#0C6B4F]/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#0C6B4F]/15" />
                <span className="ml-3 hidden h-5 flex-1 rounded-md bg-[#F7F5F0] sm:block" />
              </div>
              <div className="space-y-4 p-6 sm:p-8" aria-hidden>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-44 rounded-md bg-[#0C6B4F]" />
                    <div className="h-3 w-28 rounded bg-[#EFE9DC]" />
                  </div>
                  <div className="rounded-full bg-[#D9F452] px-3 py-1 text-xs font-bold text-[#101210]">
                    INV-2026-048
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 rounded-xl border border-[#E7E2D8] p-3">
                    <div className="h-3 w-16 rounded bg-[#EFE9DC]" />
                    <div className="h-3 w-24 rounded bg-[#EFE9DC]" />
                  </div>
                  <div className="space-y-2 rounded-xl border border-[#E7E2D8] p-3">
                    <div className="h-3 w-16 rounded bg-[#EFE9DC]" />
                    <div className="h-3 w-24 rounded bg-[#EFE9DC]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 rounded-md bg-[#F7F5F0]" />
                  <div className="h-8 rounded-md bg-[#F7F5F0]" />
                  <div className="h-8 rounded-md bg-[#F7F5F0]" />
                </div>
                <div className="flex justify-end">
                  <div className="w-44 space-y-2">
                    <div className="h-3 rounded bg-[#EFE9DC]" />
                    <div className="h-3 rounded bg-[#EFE9DC]" />
                    <div className="h-6 rounded-md bg-[#0C6B4F]" />
                  </div>
                </div>
              </div>
            </div>
            <div className="animate-floaty absolute -top-5 -right-3 flex items-center gap-2 rounded-full bg-[#101210] px-4 py-2 text-sm font-semibold text-[#D9F452] shadow-xl sm:-right-8">
              <CheckIcon size={16} />
              Paid ✓ ₹48,200
            </div>
            <div className="animate-floaty-slow absolute -bottom-5 -left-3 flex items-center gap-2 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#0C6B4F] shadow-xl sm:-left-8">
              <BoltIcon size={16} />
              GST-ready
            </div>
          </motion.div>
        </section>

        {/* Marquee strip */}
        <section aria-label="Highlights" className="overflow-hidden border-y border-[#101210] bg-[#D9F452] py-3">
          <div className="animate-marquee flex w-max items-center gap-8 pr-8 whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-8 text-sm font-bold tracking-wide text-[#101210] uppercase">
                {item}
                <BoltIcon size={16} />
              </span>
            ))}
          </div>
        </section>

        {/* Proof strip */}
        <section aria-label="Proof" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-2 text-center text-sm sm:flex-row sm:gap-10">
            <p className="font-mono font-semibold">2,000+ invoices created</p>
            <p className="flex items-center gap-1.5 text-[#6B675E]">
              <CheckIcon size={16} className="text-[#0C6B4F]" />
              Free forever basics
            </p>
            <p className="flex items-center gap-1.5 text-[#6B675E]">
              <CheckIcon size={16} className="text-[#0C6B4F]" />
              No signup needed
            </p>
          </div>
        </section>

        {/* Features — dark cards */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div {...reveal} viewport={{ once: true, margin: "-80px" }}>
            <h2
              className="text-center text-4xl tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Everything you need, <em className="text-[#0C6B4F]">nothing</em> you
              don&apos;t
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[#6B675E]">
              Built for freelancers and small businesses who would rather be
              working than wrestling with billing software.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.title}
                {...reveal}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="rounded-3xl bg-[#101210] p-7 text-[#F7F5F0] shadow-lg"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D9F452] text-[#101210]">
                  <f.icon size={22} />
                </span>
                <h3
                  className="mt-5 text-xl"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{f.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Templates — dark section */}
        <section id="templates" className="bg-[#101210] text-[#F7F5F0]">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <motion.div {...reveal} viewport={{ once: true, margin: "-80px" }}>
              <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-[#D9F452] uppercase">
                <TemplatesIcon size={16} /> 8 designer templates
              </p>
              <h2
                className="mt-3 text-center text-4xl tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-display), Georgia, serif" }}
              >
                Pick a template, <em className="text-[#D9F452]">make it yours</em>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-white/60">
                {FREE_COUNT} free forever. Upgrade for the full premium collection.
              </p>
            </motion.div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATE_CATALOG.map((t, i) => (
                <motion.article
                  key={t.id}
                  {...reveal}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 4) * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-shadow hover:shadow-[0_0_32px_-8px_#D9F45266]"
                >
                  <div
                    className="h-28 rounded-xl border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${t.accent}55, ${t.accent}14)`,
                    }}
                    aria-hidden
                  >
                    <div className="space-y-1.5 p-4">
                      <div className="h-3 w-2/3 rounded" style={{ backgroundColor: t.accent }} />
                      <div className="h-2 w-1/2 rounded bg-white/20" />
                      <div className="h-2 w-3/4 rounded bg-white/20" />
                      <div className="h-2 w-2/3 rounded bg-white/20" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {t.isFree ? (
                      <span className="rounded-full bg-[#D9F452] px-2.5 py-0.5 text-xs font-bold text-[#101210]">
                        FREE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-[#D9F452]">
                        <LockIcon size={12} />
                        PRO
                      </span>
                    )}
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                  </div>
                  <p className="mt-1.5 flex-1 text-sm text-white/55">{t.tagline}</p>
                  <a
                    href={`/create/invoice?template=${t.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-[#D9F452] hover:text-[#D9F452]"
                  >
                    {t.isFree ? "Use Template" : "Preview"}
                  </a>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div {...reveal} viewport={{ once: true, margin: "-80px" }}>
            <h2
              className="text-center text-4xl tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Simple, <em className="text-[#0C6B4F]">honest</em> pricing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-[#6B675E]">
              Start free. Upgrade only when premium templates pay for themselves.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <motion.article
              {...reveal}
              viewport={{ once: true, margin: "-80px" }}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 font-mono text-4xl font-extrabold">
                ₹0<span className="font-sans text-base font-normal text-[#6B675E]"> forever</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {["2 free templates", "Unlimited invoices", "PDF downloads with watermark"].map((li) => (
                  <li key={li} className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[#0C6B4F]" /> {li}
                  </li>
                ))}
              </ul>
              <a
                href="/pricing"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-[#E7E2D8] bg-[#F7F5F0] px-8 py-3 text-base font-semibold transition-colors hover:bg-[#EFE9DC]"
              >
                Start Free
              </a>
            </motion.article>
            <motion.article
              {...reveal}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="relative flex flex-col rounded-3xl bg-[#0C6B4F] p-8 text-white shadow-2xl"
            >
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#D9F452] px-4 py-1 text-xs font-bold whitespace-nowrap text-[#101210]">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 font-mono text-4xl font-extrabold">
                ₹999
                <span className="font-sans text-base font-normal text-white/70"> lifetime or ₹199/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {["All 8 templates", "No watermark", "Custom logo", "GST invoice template"].map((li) => (
                  <li key={li} className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[#D9F452]" /> {li}
                  </li>
                ))}
              </ul>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/pricing"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D9F452] px-8 py-3 text-base font-bold text-[#101210] transition-transform"
              >
                Go Pro <ArrowRightIcon size={18} />
              </motion.a>
            </motion.article>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="testimonials-heading" className="border-y border-[#E7E2D8] bg-[#EFE9DC]/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <motion.h2
              id="testimonials-heading"
              {...reveal}
              viewport={{ once: true, margin: "-80px" }}
              className="text-center text-4xl tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Loved by freelancers <em className="text-[#0C6B4F]">across India</em>
            </motion.h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <motion.figure
                  key={t.name}
                  {...reveal}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] p-6 shadow-sm"
                >
                  <div className="flex gap-1" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <StarIcon key={s} size={16} className="text-[#0C6B4F]" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="block text-[#6B675E]">{t.role}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.h2
            id="faq-heading"
            {...reveal}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Frequently asked <em className="text-[#0C6B4F]">questions</em>
          </motion.h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <motion.div
            {...reveal}
            viewport={{ once: true, margin: "-80px" }}
            className="relative overflow-hidden rounded-[2rem] bg-[#0C6B4F] px-6 py-14 text-center text-white sm:px-12 sm:py-20"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#D9F452]/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#D9F452]/10 blur-3xl"
            />
            <ChartIcon size={40} className="mx-auto text-[#D9F452]" />
            <h2
              id="cta-heading"
              className="mx-auto mt-4 max-w-2xl text-4xl leading-tight tracking-tight text-balance sm:text-6xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Send your first <em className="text-[#D9F452]">beautiful</em> invoice today
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Free forever for basics. No signup, no credit card — just a better
              invoice in two minutes.
            </p>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/create/invoice"
              className={cn(
                "mt-8 inline-flex items-center gap-2 rounded-full bg-[#D9F452] px-8 py-3.5 text-base font-bold text-[#101210]",
              )}
            >
              Start Free — No Signup
              <ArrowRightIcon size={18} />
            </motion.a>
          </motion.div>
        </section>
      </main>

      {/* Footer — dark */}
      <footer className="bg-[#101210] text-[#F7F5F0]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <a href="#" aria-label="SmartBillr home" className="flex items-center justify-center sm:justify-start">
              <Wordmark size={28} />
            </a>
            <p className="mt-2 text-sm text-white/55">
              Beautiful invoices in minutes. Free for basics.
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-6 text-sm text-white/60">
            <a href="#features" className="transition-colors hover:text-[#D9F452]">
              Features
            </a>
            <a href="#templates" className="transition-colors hover:text-[#D9F452]">
              Templates
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#D9F452]">
              Pricing
            </a>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/45 sm:px-6">
            © 2026 SmartBillr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
