"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "../../lib/utils";

type AnchoredMenuProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  menuClassName?: string;
};

type MenuPos = { top?: number; bottom?: number; right: number };

const GAP = 6;
/** Fallback height used for flip math before the menu has been measured. */
const EST_MENU_HEIGHT = 280;

/**
 * A menu rendered with `position: fixed` anchored to a trigger element, so it
 * is never clipped by an `overflow` ancestor (e.g. an `overflow-x-auto` table
 * wrapper). Position is computed from the trigger's `getBoundingClientRect`:
 * below the trigger by default, flipped upward when it would overflow the
 * viewport bottom. Closes on Escape, backdrop click, scroll, or resize.
 */
export function AnchoredMenu({
  open,
  onClose,
  anchorRef,
  children,
  menuClassName,
}: AnchoredMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<MenuPos | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const height =
        menuRef.current?.offsetHeight || EST_MENU_HEIGHT;
      const right = Math.max(0, window.innerWidth - rect.right);
      if (rect.bottom + GAP + height > window.innerHeight) {
        setPos({ bottom: Math.max(0, window.innerHeight - rect.top + GAP), right });
      } else {
        setPos({ top: rect.bottom + GAP, right });
      }
    };
    compute();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Closing on scroll/resize is simpler than live re-anchoring and avoids
    // a stale fixed menu lingering after layout shifts.
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-transparent"
      />
      <div
        ref={menuRef}
        role="menu"
        style={
          pos
            ? {
                position: "fixed",
                top: pos.top,
                bottom: pos.bottom,
                right: pos.right,
              }
            : { position: "fixed", visibility: "hidden" }
        }
        className={cn(
          "z-40 animate-[menu-pop_.14s_ease-out] rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8]/95 p-1.5 shadow-[0_24px_60px_-20px_rgba(20,20,18,0.45)] backdrop-blur",
          menuClassName,
        )}
      >
        {children}
      </div>
    </>
  );
}
