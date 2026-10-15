"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/Brand";
import { BackButton } from "@/components/BackButton";
import {
  DashboardIcon,
  InvoiceIcon,
  CardIcon,
  PlusIcon,
  type IconProps,
} from "@/components/icons";
import { cn } from "@/lib/utils";

/** Small bordered button style for topbar actions. */
export const topbarActionCls =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E7E2D8] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-[#3f3c37] transition hover:border-[#0C6B4F]/50 hover:text-[#0C6B4F] disabled:cursor-not-allowed disabled:opacity-50";

/** Small bordered topbar button. */
export function TopbarAction({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(topbarActionCls, className)} {...props} />
  );
}

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: (props: IconProps) => React.JSX.Element;
  match: (pathname: string) => boolean;
};

const NAV_MAIN: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    Icon: DashboardIcon,
    match: (p) => p === "/dashboard" || p === "/",
  },
  {
    id: "invoices",
    label: "Invoices",
    href: "/invoices",
    Icon: InvoiceIcon,
    match: (p) => p.startsWith("/invoices"),
  },
  {
    id: "assets",
    label: "Manage Assets",
    href: "/assets",
    Icon: CardIcon,
    match: (p) => p.startsWith("/assets"),
  },
];

const NAV_CREATE: NavItem[] = [
  {
    id: "create",
    label: "Create Invoice",
    href: "/create/invoice",
    Icon: PlusIcon,
    match: (p) => p.startsWith("/create"),
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
        active
          ? "bg-[#0C6B4F] text-white shadow-[0_8px_20px_-10px_rgba(12,107,79,0.8)]"
          : "text-[#3f3c37] hover:bg-[#0C6B4F]/8 hover:text-[#0C6B4F]",
      )}
    >
      <item.Icon size={18} className="shrink-0" />
      {item.label}
    </Link>
  );
}

type AppShellProps = {
  title: string;
  /** Icon shown next to the serif title in the topbar. */
  icon?: ReactNode;
  /** Right-side topbar actions. */
  actions?: ReactNode;
  /** Override auto-detected active nav item. */
  activeId?: string;
  /** Where the topbar BackButton points. */
  backHref?: string;
  children: ReactNode;
};

export function AppShell({
  title,
  icon,
  actions,
  activeId,
  backHref = "/templates",
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname() ?? "";
  const allItems = [...NAV_MAIN, ...NAV_CREATE];
  const detected = allItems.find((i) => i.match(pathname))?.id;
  const active = activeId ?? detected;

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/" aria-label="SmartBillr home" className="px-1">
        <Wordmark size={30} />
      </Link>

      <nav aria-label="Primary" className="space-y-5">
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
            Navigation
          </p>
          <div className="space-y-1">
            {NAV_MAIN.map((item) => (
              <NavLink key={item.id} item={item} active={active === item.id} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold tracking-widest text-stone-400 uppercase">
            Create
          </p>
          <div className="space-y-1">
            {NAV_CREATE.map((item) => (
              <NavLink key={item.id} item={item} active={active === item.id} />
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto space-y-3">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-[#0C6B4F]/25 bg-[#0C6B4F]/5 px-3 py-1 text-[11px] font-bold tracking-wide text-[#0C6B4F] uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0C6B4F]" />
          Proudly Open Source
        </p>
        <div className="rounded-2xl border border-[#E7E2D8] bg-[#FFFDF8] p-4 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]">
          <p className="text-sm font-bold text-stone-900">Editing as guest</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Log in to sync invoices across devices.
          </p>
          <Link
            href="/api/auth/signin"
            className="mt-3 block rounded-xl bg-[#141412] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#0C6B4F]"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="paper-texture min-h-screen bg-[#F7F5F0]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-[#E7E2D8] bg-[#FBFAF6]/80 lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div
              className="absolute inset-0 bg-[#101210]/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-[#E7E2D8] bg-[#FBFAF6] shadow-2xl">
              <div className="flex justify-end p-3 pb-0">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg border border-[#E7E2D8] p-1.5 text-stone-500 hover:text-stone-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar}
            </aside>
          </div>
        ) : null}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#E7E2D8] bg-[#F7F5F0]/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="shrink-0 rounded-lg border border-[#E7E2D8] bg-[#FFFDF8] p-1.5 text-stone-600 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <BackButton href={backHref} className="hidden shrink-0 border-[#E7E2D8] text-stone-500 sm:inline-flex" />
              <span className="flex min-w-0 items-center gap-2">
                {icon ? <span className="shrink-0 text-[#0C6B4F]">{icon}</span> : null}
                <h1
                  className="truncate text-xl tracking-tight text-[#141412] sm:text-2xl"
                  style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                >
                  {title}
                </h1>
              </span>
              {actions ? (
                <div className="ml-auto flex min-w-0 items-center gap-1.5 overflow-x-auto">
                  {actions}
                </div>
              ) : null}
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
