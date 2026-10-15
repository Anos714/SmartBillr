"use client";

import { useState } from "react";
import { motion } from "motion/react";

import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Billing = "lifetime" | "monthly";

const FREE_FEATURES = ["2 free templates", "Unlimited invoices", "PDF downloads with watermark"];

const PRO_FEATURES = [
  "All 8 templates",
  "No watermark",
  "Custom logo",
  "GST invoice template",
];

const COMPARE: { row: string; free: string; pro: string }[] = [
  { row: "Templates", free: "2", pro: "8" },
  { row: "Watermark", free: "Yes", pro: "No" },
  { row: "GST invoice", free: "—", pro: "✓" },
  { row: "Support", free: "Community", pro: "Priority" },
];

export function PricingCards({
  freeHref = "/create/invoice",
  proHref = "/create/invoice",
  showDodoNote = true,
}: {
  freeHref?: string;
  proHref?: string;
  showDodoNote?: boolean;
}) {
  const [billing, setBilling] = useState<Billing>("lifetime");

  return (
    <div>
      <div
        className="mx-auto flex w-fit items-center gap-1 rounded-full border border-[#E7E2D8] bg-[#FFFDF8] p-1"
        role="group"
        aria-label="Billing period"
      >
        {(["lifetime", "monthly"] as Billing[]).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBilling(b)}
            aria-pressed={billing === b}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors",
              billing === b ? "bg-[#101210] text-[#D9F452]" : "text-[#6B675E] hover:text-[#141412]",
            )}
          >
            {b === "lifetime" ? "Lifetime" : "Monthly"}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="flex flex-col rounded-3xl border border-[#E7E2D8] bg-[#FFFDF8] p-8 shadow-sm"
        >
          <h3 className="text-lg font-semibold">Free</h3>
          <p className="mt-2 font-mono text-4xl font-extrabold">
            ₹0<span className="font-sans text-base font-normal text-[#6B675E]"> forever</span>
          </p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {FREE_FEATURES.map((li) => (
              <li key={li} className="flex items-center gap-2">
                <CheckIcon size={16} className="shrink-0 text-[#0C6B4F]" aria-hidden /> {li}
              </li>
            ))}
          </ul>
          <a
            href={freeHref}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-[#E7E2D8] bg-[#F7F5F0] px-8 py-3 text-base font-semibold transition-colors hover:bg-[#EFE9DC]"
          >
            Start Free
          </a>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="relative flex flex-col rounded-3xl bg-[#0C6B4F] p-8 text-white shadow-[0_0_64px_-16px_#0C6B4F99]"
        >
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#D9F452] px-4 py-1 text-xs font-bold whitespace-nowrap text-[#101210] shadow-lg">
            MOST POPULAR
          </span>
          <h3 className="text-lg font-semibold">Pro</h3>
          {billing === "lifetime" ? (
            <p className="mt-2 font-mono text-4xl font-extrabold">
              ₹999{" "}
              <span className="align-middle font-sans text-lg font-normal text-white/60 line-through">
                ₹1,999
              </span>{" "}
              <span className="font-sans text-base font-normal text-white/70">lifetime</span>
            </p>
          ) : (
            <p className="mt-2 font-mono text-4xl font-extrabold">
              ₹199<span className="font-sans text-base font-normal text-white/70"> /month</span>
            </p>
          )}
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {PRO_FEATURES.map((li) => (
              <li key={li} className="flex items-center gap-2">
                <CheckIcon size={16} className="shrink-0 text-[#D9F452]" aria-hidden /> {li}
              </li>
            ))}
          </ul>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={proHref}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D9F452] px-8 py-3 text-base font-bold text-[#101210]"
          >
            Go Pro <ArrowRightIcon size={18} />
          </motion.a>
        </motion.article>
      </div>

      <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]">
        <table className="w-full text-sm">
          <caption className="px-4 pt-4 text-left font-semibold">Compare plans</caption>
          <thead>
            <tr className="text-left text-xs tracking-wide text-[#6B675E] uppercase">
              <th scope="col" className="px-4 py-2 font-semibold">
                Feature
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                Free
              </th>
              <th scope="col" className="px-4 py-2 font-semibold">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.row} className="border-t border-[#E7E2D8]">
                <th scope="row" className="px-4 py-2 text-left font-medium">
                  {r.row}
                </th>
                <td className="px-4 py-2 text-[#6B675E]">{r.free}</td>
                <td className="px-4 py-2 font-semibold text-[#0C6B4F]">{r.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-sm text-[#6B675E]">
        7-day money-back guarantee • Cancel anytime. Secure checkout.
      </p>
      {showDodoNote ? (
        <p className="mt-2 text-center text-sm text-[#6B675E]">
          Dodo checkout coming in Step 5 — buttons currently link /create/invoice.
        </p>
      ) : null}
    </div>
  );
}
