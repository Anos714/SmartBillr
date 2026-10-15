"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function BackButton({ href = "/", label = "Back", className }: BackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={`${label} — go to ${href}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current px-3 py-1.5 text-sm font-medium opacity-80 transition hover:opacity-100",
        className,
      )}
    >
      <ArrowLeftIcon size={16} aria-hidden />
      {label}
    </button>
  );
}
