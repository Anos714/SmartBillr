import type { SVGProps } from "react";

export type IconProps = {
  size?: number;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "width" | "height" | "className">;

function Base({
  size = 20,
  className,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Sharp geometric bolt — mirrors the V3 wordmark bolt (solid + hairline outline). */
export function BoltIcon(props: IconProps) {
  return (
    <Base {...props} strokeLinejoin="miter" strokeLinecap="square">
      <path
        d="M13.2 2 5.6 13.4h5.5L10 22l8.4-11.6h-5.5L13.2 2Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M13.2 2 5.6 13.4h5.5L10 22l8.4-11.6h-5.5L13.2 2Z" fill="none" />
    </Base>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 12H5" strokeWidth={2} />
      <path d="m10.5 6-6 6 6 6" strokeWidth={2} />
      <circle cx="20" cy="12" r="1.4" fill="currentColor" opacity={0.25} stroke="none" />
    </Base>
  );
}

export function InvoiceIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
    </Base>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="2" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="2" />
    </Base>
  );
}

export function TemplatesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" fill="currentColor" opacity={0.25} stroke="none" />
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3.5 12.5 8.5 4.7 8.5-4.7" />
      <path d="m3.5 16.5 8.5 4.7 8.5-4.7" />
    </Base>
  );
}

export function PaletteIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-.9 1.9-1.8 0-.9-.7-1.4-.7-2.2 0-.9.7-1.6 1.8-1.6h2.3a3.7 3.7 0 0 0 3.7-3.7C21 6.9 16.9 3.5 12 3.5Z"
        fill="currentColor"
        opacity={0.25}
        stroke="none"
      />
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-.9 1.9-1.8 0-.9-.7-1.4-.7-2.2 0-.9.7-1.6 1.8-1.6h2.3a3.7 3.7 0 0 0 3.7-3.7C21 6.9 16.9 3.5 12 3.5Z" />
      <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity={0.25} stroke="none" />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.2 3.8 5.1 3.8 8.5s-1.3 6.3-3.8 8.5c-2.5-2.2-3.8-5.1-3.8-8.5S9.5 5.7 12 3.5Z" />
    </Base>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M12 2.8 4.5 5.8v5.4c0 4.6 3.1 7.9 7.5 9.8 4.4-1.9 7.5-5.2 7.5-9.8V5.8L12 2.8Z"
        fill="currentColor"
        opacity={0.25}
        stroke="none"
      />
      <path d="M12 2.8 4.5 5.8v5.4c0 4.6 3.1 7.9 7.5 9.8 4.4-1.9 7.5-5.2 7.5-9.8V5.8L12 2.8Z" />
      <path d="m9 11.6 2.2 2.2L15.4 9.5" />
    </Base>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="M12 3c.6 4.2 2.6 6.2 6.8 6.8-4.2.6-6.2 2.6-6.8 6.8-.6-4.2-2.6-6.2-6.8-6.8 4.2-.6 6.2-2.6 6.8-6.8Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M19 3.5c.3 2 1.2 2.9 3.2 3.2-2 .3-2.9 1.2-3.2 3.2-.3-2-1.2-2.9-3.2-3.2 2-.3 2.9-1.2 3.2-3.2Z"
        fill="currentColor"
        opacity={0.25}
        stroke="none"
      />
      <path d="M5.5 16.5c.4 2.6 1.6 3.8 4.2 4.2-2.6.4-3.8 1.6-4.2 4.2-.4-2.6-1.6-3.8-4.2-4.2 2.6-.4 3.8-1.6 4.2-4.2Z" fill="currentColor" opacity={0.25} stroke="none" />
    </Base>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12h15" strokeWidth={2} />
      <path d="m13.5 6 6 6-6 6" strokeWidth={2} />
      <circle cx="4" cy="12" r="1.4" fill="currentColor" opacity={0.25} stroke="none" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity={0.25} stroke="none" />
      <path d="m8 12.4 2.8 2.8L16.5 9" strokeWidth={2.2} />
    </Base>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <circle cx="12" cy="15.2" r="1.3" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3.5v11" strokeWidth={2} />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" strokeWidth={2} />
      <path d="M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
      <path d="M4.5 16.5v2a2 2 0 0 0 2 2h11" fill="currentColor" opacity={0.25} stroke="none" />
    </Base>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity={0.25} stroke="none" />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" strokeWidth={2} />
    </Base>
  );
}

export function CardIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="6" width="18" height="12.5" rx="2.5" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="3" y="6" width="18" height="12.5" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M6.5 14.8h4" strokeWidth={2} />
    </Base>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 4v15a1 1 0 0 0 1 1h15" />
      <rect x="7.5" y="12" width="3" height="5" rx="1" fill="currentColor" stroke="none" />
      <rect x="12" y="9" width="3" height="8" rx="1" fill="currentColor" opacity={0.25} stroke="none" />
      <rect x="16.5" y="6" width="3" height="11" rx="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function ZapIcon(props: IconProps) {
  return <BoltIcon {...props} />;
}

export function StarIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path
        d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8L12 3Z" opacity={0.35} />
    </Base>
  );
}
