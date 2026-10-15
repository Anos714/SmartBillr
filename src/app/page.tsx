"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

import { Logo, Wordmark } from "@/components/Brand";
import Link from "next/link";
import { PricingCards } from "@/components/PricingCards";
import { TemplatesGrid } from "@/components/TemplatesGrid";
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
  TemplatesIcon,
} from "@/components/icons";
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

const BENTO = [
  {
    icon: InvoiceIcon,
    title: "Live preview editor",
    body: "Type on the left, watch a pixel-perfect invoice render on the right. What you see is exactly what your client gets.",
    span: "md:col-span-4",
    mock: true,
  },
  {
    icon: BoltIcon,
    title: "No-signup guest mode",
    body: "Your first invoice in under two minutes. No account, no card, no friction.",
    span: "md:col-span-2",
  },
  {
    icon: ShieldIcon,
    title: "GST invoice for India",
    body: "GSTIN, HSN codes, and automatic tax splits keep every bill compliant.",
    span: "md:col-span-4",
    gst: true,
  },
  {
    icon: TemplatesIcon,
    title: "8 designer templates",
    body: "From Minimal White to Bold Dark — two free forever, six premium.",
    span: "md:col-span-2",
  },
  {
    icon: PaletteIcon,
    title: "Cloudinary assets",
    body: "Drop in your logo and signature. Crisp on screen, razor-sharp in print.",
    span: "md:col-span-3",
  },
  {
    icon: LockIcon,
    title: "Private by design",
    body: "Invoices render in your browser. Nothing stored unless you ask us to.",
    span: "md:col-span-3",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "My clients started paying faster the week I switched. The GST template alone is worth ten times the Pro price.",
    name: "Ananya Sharma",
    role: "Freelance Designer, Mumbai",
    initials: "AS",
  },
  {
    quote:
      "Finally, an invoice tool that doesn't look like a spreadsheet from 2004. Created my first bill in under two minutes.",
    name: "Rohan Mehta",
    role: "Freelance Designer, Bengaluru",
    initials: "RM",
  },
  {
    quote:
      "No signup, no nonsense. I made a GST invoice for my store between orders and it just worked.",
    name: "Priya Nair",
    role: "Freelance Designer, Kochi",
    initials: "PN",
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

function TotalCountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 55, damping: 16 });
  const [display, setDisplay] = useState(0);
  const instantValue = inView && reduceMotion;

  useEffect(() => {
    if (inView && !reduceMotion) {
      mv.set(value);
    }
  }, [inView, reduceMotion, value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref}>₹{(instantValue ? value : display).toLocaleString("en-IN")}</span>;
}

function StarRow() {
  return (
    <div className="flex gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, s) => (
        <svg
          key={s}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden
          className="text-[#65a30d]"
        >
          <path
            d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z"
            fill="#84cc16"
            stroke="#65a30d"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  const num = String(index + 1).padStart(2, "0");
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[#FFFDF8] transition-colors duration-300",
        open ? "border-[#84cc16] shadow-[0_0_0_1px_#84cc16]" : "border-[#E7E2D8]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-5 py-4 text-left font-medium"
      >
        <span className="font-mono text-xs font-bold text-[#0C6B4F]/60">{num}</span>
        <span className="flex-1">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none transition-colors",
            open ? "bg-[#D9F452] text-[#101210]" : "bg-[#0C6B4F] text-[#D9F452]",
          )}
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.32, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 pl-14 text-sm leading-6 text-[#6B675E]">{a}</p>
      </motion.div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group relative w-fit text-sm text-white/60 transition-colors hover:text-[#D9F452]"
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-[#D9F452] transition-transform duration-300 group-hover:scale-x-100"
      />
    </a>
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
            <Wordmark size={28} tone="dark" />
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

          {/* Realistic invoice preview */}
          <motion.div
            initial={{ opacity: 0, y: 48, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="relative mx-auto mt-16 max-w-3xl"
          >
            <div
              className="relative rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-6 text-left shadow-2xl sm:p-8"
              role="img"
              aria-label="Preview of a SmartBillr tax invoice for PixelWorks Studio billed to Acme Corp, total 48,200 rupees, marked paid"
            >
              <span className="absolute top-1/2 -right-3 -translate-y-1/2 rotate-90 rounded-md border-2 border-[#0C6B4F] px-3 py-1 text-sm font-extrabold tracking-[0.2em] text-[#0C6B4F] uppercase">
                Paid
              </span>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Logo size={40} />
                  <div>
                    <p className="text-sm font-bold">PixelWorks Studio</p>
                    <p className="text-xs text-[#6B675E]">hello@pixelworks.in • GSTIN 27ABCDE1234F1Z5</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold tracking-wide">TAX INVOICE</p>
                  <p className="mt-1 inline-block rounded-full bg-[#0C6B4F]/10 px-3 py-0.5 font-mono text-xs font-bold text-[#0C6B4F]">
                    INV-2026-0001
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                <div className="rounded-xl border border-[#E7E2D8] p-3">
                  <p className="text-[11px] font-bold tracking-wider text-[#6B675E] uppercase">From</p>
                  <p className="mt-0.5 font-semibold">PixelWorks Studio</p>
                  <p className="text-xs text-[#6B675E]">Mumbai, India</p>
                </div>
                <span aria-hidden className="text-[#0C6B4F]">
                  →
                </span>
                <div className="rounded-xl border border-[#E7E2D8] p-3">
                  <p className="text-[11px] font-bold tracking-wider text-[#6B675E] uppercase">Bill to</p>
                  <p className="mt-0.5 font-semibold">Acme Corp</p>
                  <p className="text-xs text-[#6B675E]">Bengaluru, India</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-[#F7F5F0] px-3 py-2">
                  <span>
                    <span className="font-semibold">Logo Design</span>{" "}
                    <span className="text-xs text-[#6B675E]">1 × ₹25,000</span>
                  </span>
                  <span className="font-mono font-bold">₹25,000</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#F7F5F0] px-3 py-2">
                  <span>
                    <span className="font-semibold">UI Screens</span>{" "}
                    <span className="text-xs text-[#6B675E]">8 × ₹3,500</span>
                  </span>
                  <span className="font-mono font-bold">₹28,000</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#F7F5F0] px-3 py-2">
                  <span>
                    <span className="font-semibold">GST</span>{" "}
                    <span className="text-xs text-[#6B675E]">18% • CGST/SGST split</span>
                  </span>
                  <span className="font-mono font-bold">incl.</span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <svg viewBox="0 0 120 36" aria-hidden className="h-9 w-28 text-[#0C6B4F]">
                    <path
                      d="M4 26 C 20 26, 24 8, 34 14 S 44 30, 54 20 S 62 10, 72 16 S 88 28, 100 18 S 110 12, 116 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="text-[11px] text-[#6B675E]">Authorised signatory</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold tracking-wider text-[#6B675E] uppercase">
                    Total due
                  </p>
                  <p className="font-mono text-3xl font-extrabold text-[#0C6B4F]">
                    <TotalCountUp value={48200} />
                  </p>
                </div>
              </div>
            </div>
            <div className="animate-floaty absolute -top-5 -right-3 flex items-center gap-2 rounded-full bg-[#101210] px-4 py-2 text-sm font-semibold text-[#D9F452] shadow-xl sm:-right-8">
              <CheckIcon size={16} />
              Paid ✓ ₹48,200 received
            </div>
            <div className="animate-floaty-slow absolute -bottom-5 -left-3 flex items-center gap-2 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#0C6B4F] shadow-xl sm:-left-8">
              <BoltIcon size={16} />
              GST-ready ✓ CGST/SGST
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

        {/* Features — bento grid */}
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
          <div className="mt-10 grid gap-6 md:grid-cols-6">
            {BENTO.map((f, i) => (
              <motion.article
                key={f.title}
                {...reveal}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className={cn(
                  "rounded-3xl border border-[#101210]/10 bg-[#101210] p-7 text-[#F7F5F0] shadow-lg transition-shadow hover:border-[#D9F452]/60 hover:shadow-[0_0_40px_-12px_#D9F45288]",
                  f.span,
                )}
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
                {f.mock ? (
                  <div aria-hidden className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/3 rounded-full bg-[#D9F452]/80" />
                      <div className="h-5 w-20 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-6 rounded-md bg-white/10" />
                      <div className="h-6 rounded-md bg-white/10" />
                      <div className="ml-auto h-6 w-1/3 rounded-md bg-[#0C6B4F]" />
                    </div>
                  </div>
                ) : null}
                {f.gst ? (
                  <div aria-hidden className="mt-5 flex flex-wrap gap-2">
                    {["GSTIN ✓", "CGST 9%", "SGST 9%", "HSN-coded"].map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-[#D9F452]/40 bg-[#D9F452]/10 px-3 py-1 text-xs font-bold text-[#D9F452]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
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
                2 free forever. Upgrade for the full premium collection.
              </p>
            </motion.div>
            <div className="mt-10">
              <TemplatesGrid />
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
          <div className="mt-10">
            <PricingCards freeHref="/create/invoice" proHref="/pricing" showDodoNote={false} />
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
            <motion.p
              {...reveal}
              viewport={{ once: true, margin: "-80px" }}
              className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-[#6B675E]"
            >
              <StarRow />
              <span>
                <strong className="font-bold text-[#141412]">4.9/5</strong> from 2,000+ creators
              </span>
            </motion.p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <motion.figure
                  key={t.name}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.12, duration: 0.55, ease: "easeOut" }}
                  whileHover={{ y: -8 }}
                  className="relative flex flex-col rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] p-6 pt-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_20px_40px_-16px_rgba(12,107,79,0.25)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-1 left-5 text-[64px] leading-none text-[#0C6B4F]/15"
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    &ldquo;
                  </span>
                  <StarRow />
                  <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-[#2b2b28]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-[#E7E2D8]/70 pt-4 text-sm">
                    <span
                      aria-hidden
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0C6B4F] to-[#84cc16] text-sm font-extrabold text-white shadow"
                    >
                      {t.initials}
                    </span>
                    <span>
                      <span className="block font-semibold">{t.name}</span>
                      <span className="block text-[13px] text-[#6B675E]">{t.role}</span>
                    </span>
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
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <motion.div
            {...reveal}
            viewport={{ once: true, margin: "-80px" }}
            className="paper-grain relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0C6B4F] via-[#0a5a42] to-[#083d2d] px-6 py-14 text-center text-white sm:px-12 sm:py-20"
          >
            <div
              aria-hidden
              className="animate-marquee pointer-events-none absolute inset-x-0 top-4 flex w-max gap-10 pr-10 text-5xl font-extrabold whitespace-nowrap text-white/[0.06] sm:text-6xl"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i}>{["₹", "$", "€"][i % 3]}</span>
              ))}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#D9F452]/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#D9F452]/10 blur-3xl"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
              <span className="animate-floaty absolute top-8 left-8 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 font-mono text-xs text-white/90 backdrop-blur">
                INV-2026-0001 • ₹48,200 ✓
              </span>
              <span className="animate-floaty-slow absolute right-10 bottom-10 rounded-full border border-[#D9F452]/30 bg-[#D9F452]/10 px-4 py-1.5 font-mono text-xs text-[#D9F452] backdrop-blur">
                Paid ✓ UPI received
              </span>
            </div>
            <ChartIcon size={40} className="relative mx-auto text-[#D9F452]" />
            <h2
              id="cta-heading"
              className="relative mx-auto mt-4 max-w-2xl text-4xl leading-tight tracking-tight text-balance sm:text-6xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Send your first <em className="text-[#D9F452]">beautiful</em> invoice today
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/70">
              Free forever for basics. No signup, no credit card — just a better
              invoice in two minutes.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.a
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                href="/create/invoice"
                className="inline-flex items-center gap-2 rounded-full bg-[#D9F452] px-8 py-3.5 text-base font-bold text-[#101210] transition-shadow hover:shadow-[0_0_32px_-6px_#D9F452]"
              >
                Start Free — No Signup
                <ArrowRightIcon size={18} />
              </motion.a>
              <a
                href="/templates"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-[#D9F452] hover:text-[#D9F452]"
              >
                See templates
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#101210] text-[#F7F5F0]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="SmartBillr home"
              className="inline-block rounded-lg transition-[filter,drop-shadow] duration-300 hover:drop-shadow-[0_0_16px_rgba(217,244,82,0.7)]"
            >
              <Wordmark size={28} tone="dark" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/55">
              Beautiful invoices in minutes. Free for basics, GST-ready for India.
            </p>
          </div>
          <nav aria-label="Product">
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Product</p>
            <ul className="mt-4 space-y-2.5">
              <li><FooterLink href="/#features">Features</FooterLink></li>
              <li><FooterLink href="/templates">Templates</FooterLink></li>
              <li><FooterLink href="/pricing">Pricing</FooterLink></li>
              <li><FooterLink href="/create/invoice">Create Invoice</FooterLink></li>
            </ul>
          </nav>
          <nav aria-label="Resources">
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Resources</p>
            <ul className="mt-4 space-y-2.5">
              <li><FooterLink href="/guides/gst-invoice">GST Guide</FooterLink></li>
              <li><FooterLink href="/guides/freelancer">Freelancer tips</FooterLink></li>
              <li><FooterLink href="/contact">Help</FooterLink></li>
              <li><FooterLink href="/llms.txt">llms.txt</FooterLink></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Company</p>
            <ul className="mt-4 space-y-2.5">
              <li><FooterLink href="/about">About</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy</FooterLink></li>
              <li><FooterLink href="/terms">Terms</FooterLink></li>
            </ul>
          </nav>
          <nav aria-label="Compare">
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase">Compare</p>
            <ul className="mt-4 space-y-2.5">
              <li><FooterLink href="/compare/invoicely-alternative">Invoicely alternative</FooterLink></li>
              <li><FooterLink href="/pricing">Free vs Pro</FooterLink></li>
              <li><FooterLink href="/templates">All templates</FooterLink></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6">
            <p className="text-xs text-white/45">© 2026 SmartBillr. All rights reserved.</p>
            <p className="flex items-center gap-2 text-xs text-white/55">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              All systems normal
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com"
                aria-label="SmartBillr on X"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-[#D9F452] hover:text-[#D9F452]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1 2h6.5l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.6 3.9H5.7L17.8 20Z" /></svg>
              </a>
              <a
                href="https://github.com"
                aria-label="SmartBillr on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-[#D9F452] hover:text-[#D9F452]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.4.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
