type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export function Logo({ size = 32, className, title = "SmartBillr logo" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="sb-tile-inline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12A37C" />
          <stop offset="1" stopColor="#0C6B4F" />
        </linearGradient>
        <linearGradient id="sb-sheen-inline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="0.62" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17.9" fill="url(#sb-tile-inline)" />
      <rect x="2" y="2" width="60" height="60" rx="17.9" fill="url(#sb-sheen-inline)" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="17.9"
        fill="none"
        stroke="#0B2E23"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.9"
        strokeWidth="2.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect x="23" y="11" width="18" height="42" rx="3.5" fill="#FFFFFF" fillOpacity="0.12" />
        <path d="M34.5 11v6.5H41" />
      </g>
      <g transform="skewX(-6)">
        <path
          d="M38.2 17 28.5 31.2h5.6L32.4 46.5 42.6 30h-5.8L38.2 17Z"
          fill="#D9F452"
          stroke="#0B2E23"
          strokeOpacity="0.3"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </g>
      <path d="M38.2 17 28.5 31.2h3.2L38.6 20l2 2.4Z" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

export function Wordmark({
  size = 32,
  className,
  tone = "light",
}: {
  size?: number;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Logo size={size} />
      <span
        className="text-[1.35rem] leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        <span className="font-normal">Smart</span>
        <span className={`font-normal ${tone === "dark" ? "text-[#5FD6A4]" : "text-[#0C6B4F]"}`}>
          Billr
        </span>
        <span aria-hidden className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#D9F452]">
          <span className="sr-only">.</span>
        </span>
      </span>
    </span>
  );
}
