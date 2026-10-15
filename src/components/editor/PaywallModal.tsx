"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Brand";
import { signIn, useSession } from "@/lib/auth-client";

type Props = {
  templateName: string;
  open: boolean;
  onClose: () => void;
};

export function PaywallModal({ templateName, open, onClose }: Props) {
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const { data: session, isPending } = useSession();
  const signedIn = Boolean(session?.user);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/auth/config")
      .then((r) => r.json())
      .then((j: { googleConfigured?: boolean }) => {
        if (!cancelled) setGoogleConfigured(Boolean(j.googleConfigured));
      })
      .catch(() => {
        if (!cancelled) setGoogleConfigured(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open ]);

  const handleSignIn = async () => {
    setBusy(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/create/invoice",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutBusy(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/dodo/checkout", { method: "POST" });
      if (res.status === 401) {
        await signIn.social({
          provider: "google",
          callbackURL: "/create/invoice",
        });
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#101210]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="paper-texture relative w-full max-w-sm rounded-[1.5rem] border border-[#E7E2D8] bg-[#FFFDF8] p-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <p className="text-xs font-bold tracking-widest text-[#0C6B4F] uppercase">Pro template</p>
        </div>
        <h2 className="mt-2 text-2xl tracking-tight" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>{templateName} is Pro</h2>
        <p className="mt-2 text-sm leading-6 text-[#6B675E]">Unlock &ldquo;{templateName}&rdquo; plus all premium designs, watermark-free PDFs, and your logo.</p>
        <div className="mt-5 space-y-2">
          {googleConfigured === false ? (
            <p className="block rounded-xl bg-stone-100 px-4 py-2.5 text-center text-xs font-semibold text-stone-500">
              Google setup pending — add keys in .env.local
            </p>
          ) : signedIn ? (
            <>
              <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={checkoutBusy || isPending}
                className="block w-full rounded-xl bg-[#101210] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0C6B4F] disabled:opacity-50"
              >
                {checkoutBusy ? "Redirecting…" : "Unlock Pro — ₹999"}
              </button>
              {checkoutError ? (
                <p role="alert" className="text-center text-xs font-semibold text-red-600">
                  {checkoutError}
                </p>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              disabled={busy || googleConfigured === null}
              className="block w-full rounded-xl bg-[#101210] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#0C6B4F] disabled:opacity-50"
            >
              {busy ? "Redirecting…" : "Sign in with Google"}
            </button>
          )}
          <Link href={`/pricing?template=${encodeURIComponent(templateName)}`} className="block rounded-xl bg-[#D9F452] px-4 py-2.5 text-center text-sm font-bold text-[#101210] hover:shadow-[0_0_24px_-6px_#D9F452]">View Pricing</Link>
          <button type="button" onClick={onClose} className="block w-full rounded-xl px-4 py-2 text-center text-sm text-[#6B675E] hover:text-[#141412]">Keep editing free templates</button>
        </div>
      </div>
    </div>
  );
}
