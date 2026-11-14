export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        stroke="var(--brand-mark-ink)"
        strokeWidth="2"
      />
      <path
        d="M9 11.5H23M9 16.5H17.5M9 21.5H14"
        stroke="var(--brand-mark-ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="21" cy="20.5" r="3.5" fill="var(--brand-mark-accent)" />
    </svg>
  );
}
