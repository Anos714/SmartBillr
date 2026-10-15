"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";

import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { signIn, useSession } from "@/lib/auth-client";
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

/** Shown after Dodo redirects back with ?success=true. Owns its own status
 * state; wrapped in Suspense by the caller so /pricing stays prerenderable. */
function SuccessBanner() {
  const searchParams = useSearchParams();
  const [proActive, setProActive] = useState<boolean | null>(null);
  const [refreshBusy, setRefreshBusy] = useState(false);

  if (searchParams.get("success") !== "true") return null;

  const handleRefreshStatus = async () => {
    setRefreshBusy(true);
    try {
      const res = await fetch("/api/billing/status");
      const data = (await res.json()) as { pro?: boolean };
      setProActive(Boolean(data.pro));
    } catch {
      setProActive(false);
    } finally {
      setRefreshBusy(false);
    }
  };

  return (
    <div
      role="status"
      className="mx-auto mb-8 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[#0C6B4F]/30 bg-[#0C6B4F]/5 px-6 py-5 text-center"
    >
      <p className="text-sm font-semibold text-[#0C6B4F]">
        Payment received — activating Pro (refresh in a few seconds)
      </p>
      <button
        type="button"
        onClick={() => void handleRefreshStatus()}
        disabled={refreshBusy}
        className="rounded-full bg-[#0C6B4F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0a5a42] disabled:opacity-50"
      >
        {refreshBusy
          ? "Checking…"
          : proActive === true
            ? "Pro active ✓"
            : "Refresh status"}
      </button>
    </div>
  );
}

export function PricingCards({
  freeHref = "/create/invoice",
  showDodoNote = true,
}: {
  freeHref?: string;
  showDodoNote?: boolean;
}) {
  const [billing, setBilling] = useState<Billing>("lifetime");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleGoPro = async () => {
    if (checkoutBusy) return;
    if (!session?.user) {
      await signIn.social({ provider: "google", callbackURL: "/pricing" });
      return;
    }
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/dodo/checkout", { method: "POST" });
      if (res.status === 401) {
        await signIn.social({ provider: "google", callbackURL: "/pricing" });
        return;
      }
      const data = (await res.json()) as {
        checkout_url?: string;
        error?: string;
      };
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error ?? "checkout_failed");
      }
      window.location.href = data.checkout_url;
    } catch {
      setCheckoutError("Checkout failed — please try again.");
    } finally {
      setCheckoutBusy(false);
    }
  };

  return (
    <div>
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>
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
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void handleGoPro()}
            disabled={checkoutBusy}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D9F452] px-8 py-3 text-base font-bold text-[#101210] disabled:opacity-60"
          >
            {checkoutBusy ? "Redirecting…" : "Go Pro"} <ArrowRightIcon size={18} />
          </motion.button>
          {checkoutError ? (
            <p role="alert" className="mt-2 text-center text-sm font-semibold text-[#FFD9D9]">
              {checkoutError}
            </p>
          ) : null}
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
          Test mode — Dodo checkout uses test cards; no real charge.
        </p>
      ) : null}
    </div>
  );
}
