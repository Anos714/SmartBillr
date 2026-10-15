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
      <rect x="2" y="2" width="60" height="60" rx="17.9" fill="#141412" />
      <rect
        x="6.5"
        y="6.5"
        width="51"
        height="51"
        rx="13.5"
        fill="none"
        stroke="#D9F452"
        strokeOpacity="0.85"
        strokeWidth="1.25"
      />
      <path
        d="M37 13 24.5 34.5h7.5L29 51l11-21.5h-7.5L37 13Z"
        fill="#D9F452"
        stroke="#D9F452"
        strokeWidth="1.5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
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
  const smartColor = tone === "dark" ? "text-white" : "text-[#141412]";
  const billrColor = tone === "dark" ? "text-[#5FD6A4]" : "text-[#0C6B4F]";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Logo size={size} />
      <span
        className="text-[1.35rem] leading-none tracking-tight"
        style={{ fontFamily: "var(--font-display), Georgia, serif" }}
      >
        <span className={`font-normal ${smartColor}`}>Smart</span>
        <span className={`font-normal ${billrColor}`}>Billr</span>
        <span aria-hidden className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#D9F452]">
          <span className="sr-only">.</span>
        </span>
      </span>
    </span>
  );
}
