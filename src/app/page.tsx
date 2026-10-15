import {
  ArrowRight,
  Check,
  Infinity as InfinityIcon,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
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
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "INR",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "999",
      priceCurrency: "INR",
    },
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
    icon: Sparkles,
    title: "Beautiful by default",
    body: "Eight designer-crafted templates with real typography, spacing, and color — invoices clients actually enjoy opening.",
  },
  {
    icon: InfinityIcon,
    title: "Free forever basics",
    body: "Two full templates, unlimited invoices, and PDF downloads. No trial, no card, no catch — free means free.",
  },
  {
    icon: ShieldCheck,
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

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <nav
          aria-label="Main"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        >
          <a href="#" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" aria-hidden />
            </span>
            SmartBillr
          </a>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#templates" className="transition-colors hover:text-foreground">
              Templates
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/create/invoice"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Sign In
            </a>
            <a
              href="/create/invoice"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Start Free
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            GST-ready for India + Global
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
            Create Beautiful Invoices
            <span className="block text-muted-foreground">Not Ugly Ones</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Free for basics, Pro for premium. Invoices your clients will love to
            pay — in under two minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/create/invoice"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Start Free — No Signup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#templates"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              View Templates
            </a>
          </div>

          {/* App preview mockup (pure CSS, no images) */}
          <div
            className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-xl border border-border bg-card text-left shadow-xl"
            role="img"
            aria-label="Preview of a SmartBillr invoice"
          >
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="ml-3 hidden h-5 flex-1 rounded-md bg-background sm:block" />
            </div>
            <div className="space-y-4 p-6 sm:p-8" aria-hidden>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 rounded-md bg-primary/90" />
                  <div className="h-3 w-28 rounded bg-muted" />
                </div>
                <div className="h-8 w-24 rounded-md bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 rounded-xl border border-border p-3">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="space-y-2 rounded-xl border border-border p-3">
                  <div className="h-3 w-16 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 rounded-md bg-muted" />
                <div className="h-8 rounded-md bg-muted" />
                <div className="h-8 rounded-md bg-muted" />
              </div>
              <div className="flex justify-end">
                <div className="w-44 space-y-2">
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-3 rounded bg-muted" />
                  <div className="h-5 rounded-md bg-primary/90" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section aria-label="Highlights" className="border-y border-border bg-muted/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-6 text-center text-sm sm:flex-row sm:gap-10 sm:px-6">
            <p className="font-semibold">2,000+ invoices created</p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" aria-hidden />
              Free forever basics
            </p>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" aria-hidden />
              No signup needed
            </p>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Built for freelancers and small businesses who would rather be
            working than wrestling with billing software.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section id="templates" className="border-y border-border bg-muted/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Pick a template, make it yours
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              {FREE_COUNT} free forever. Upgrade for the full premium collection.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEMPLATE_CATALOG.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div
                    className="h-28 rounded-xl border border-border"
                    style={{ background: `linear-gradient(135deg, ${t.accent}26, ${t.accent}08)` }}
                    aria-hidden
                  >
                    <div className="space-y-1.5 p-4">
                      <div
                        className="h-3 w-2/3 rounded"
                        style={{ backgroundColor: t.accent }}
                      />
                      <div className="h-2 w-1/2 rounded bg-muted" />
                      <div className="h-2 w-3/4 rounded bg-muted" />
                      <div className="h-2 w-2/3 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {t.isFree ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        FREE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Lock className="h-3 w-3" aria-hidden />
                        PRO
                      </span>
                    )}
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                  </div>
                  <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{t.tagline}</p>
                  <a
                    href={`/create/invoice?template=${t.id}`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "mt-4 w-full",
                    )}
                  >
                    {t.isFree ? "Use Template" : "Preview"}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Start free. Upgrade only when premium templates pay for themselves.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="flex flex-col rounded-xl border border-border bg-card p-8 shadow-sm">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-4xl font-extrabold">
                ₹0
                <span className="text-base font-normal text-muted-foreground"> forever</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />2 free templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />Unlimited invoices
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />PDF downloads with watermark
                </li>
              </ul>
              <a
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "mt-8 w-full",
                )}
              >
                Start Free
              </a>
            </article>
            <article className="relative flex flex-col rounded-xl border-2 border-indigo-600 bg-card p-8 shadow-lg">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
                Most popular
              </span>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-4xl font-extrabold">
                ₹999
                <span className="text-base font-normal text-muted-foreground">
                  {" "}lifetime or ₹199/mo
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />All 8 templates
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />No watermark
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />Custom logo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" aria-hidden />GST invoice template
                </li>
              </ul>
              <a
                href="/pricing"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "mt-8 w-full bg-indigo-600 hover:bg-indigo-700",
                )}
              >
                Go Pro
              </a>
            </article>
          </div>
        </section>

        {/* Testimonials */}
        <section aria-labelledby="testimonials-heading" className="border-y border-border bg-muted/50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <h2 id="testimonials-heading" className="text-center text-3xl font-bold tracking-tight">
              Loved by freelancers across India
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex gap-1" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 text-sm leading-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold">{t.name}</span>
                    <span className="block text-muted-foreground">{t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 id="faq-heading" className="text-center text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
              >
                <summary className="cursor-pointer list-none font-medium">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA band */}
        <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="rounded-xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <h2 id="cta-heading" className="text-3xl font-bold tracking-tight">
              Send your first beautiful invoice today
            </h2>
            <p className="mx-auto mt-3 max-w-md opacity-80">
              Free forever for basics. No signup, no credit card — just a better
              invoice in two minutes.
            </p>
            <a
              href="/create/invoice"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "mt-8",
              )}
            >
              Start Free — No Signup
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <a href="#" className="flex items-center justify-center gap-2 font-bold sm:justify-start">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Zap className="h-3.5 w-3.5" aria-hidden />
              </span>
              SmartBillr
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Beautiful invoices in minutes. Free for basics.
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#templates" className="transition-colors hover:text-foreground">
              Templates
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
            © 2026 SmartBillr. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
