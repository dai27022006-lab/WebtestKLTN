export function EditorialEmptyIllustration({
  title = 'Chưa có dữ liệu',
}: {
  title?: string;
}) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      role="img"
      aria-label={title}
      style={{ marginInline: 'auto' }}
    >
      <rect
        x="16"
        y="22"
        width="64"
        height="52"
        rx="8"
        stroke="var(--ink-soft)"
        strokeWidth="1.75"
      />
      <path
        d="M16 36H80"
        stroke="var(--ink-soft)"
        strokeWidth="1.75"
      />
      <circle cx="24" cy="29" r="2" fill="var(--accent)" />
      <circle cx="31" cy="29" r="2" fill="var(--ink-soft)" />
      <path
        d="M32 50H64M38 60H58"
        stroke="var(--ink-soft)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle
        cx="68"
        cy="64"
        r="10"
        fill="var(--bg-canvas)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      <path
        d="M64 64H72"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
