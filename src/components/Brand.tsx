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
          <stop offset="0" stopColor="#12795B" />
          <stop offset="1" stopColor="#0C6B4F" />
        </linearGradient>
        <linearGradient id="sb-shine-inline" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17.9" fill="url(#sb-tile-inline)" />
      <rect x="2" y="2" width="60" height="60" rx="17.9" fill="url(#sb-shine-inline)" />
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="17.9"
        fill="none"
        stroke="#101210"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M36.5 10 18 36.6c-.5.7 0 1.7.9 1.7h8.6L27.2 54c-.4 1 1 1.7 1.7.9l18.6-26.3c.5-.7 0-1.7-.9-1.7h-8.8L37.9 11c.2-1-1-1.6-1.4-.6Z"
        fill="#D9F452"
      />
      <path
        d="M36.5 10 18 36.6c-.5.7 0 1.7.9 1.7h3l14.6-20.9 3.4-5.2c-.3-.9-1.5-1.4-3.4-2.2Z"
        fill="#FFFFFF"
        opacity="0.22"
      />
    </svg>
  );
}

export function Wordmark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Logo size={size} />
      <span
        className="font-display text-[1.35rem] leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        SmartBillr
      </span>
    </span>
  );
}
