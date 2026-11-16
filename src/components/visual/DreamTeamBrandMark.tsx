interface DreamTeamBrandMarkProps {
  size?: number;
  showWordmark?: boolean;
  inverted?: boolean;
  subtitle?: string;
}

export function DreamTeamBrandMark({
  size = 34,
  showWordmark = false,
  inverted = false,
  subtitle,
}: DreamTeamBrandMarkProps) {
  const outerInk = inverted ? '#ffffff' : 'var(--brand-mark-ink)';
  const innerCutout = inverted ? '#0d1512' : 'var(--bg-canvas)';
  const accentFill = inverted ? '#48b594' : 'var(--brand-mark-accent)';
  const centerFill = inverted ? '#8cd9b3' : 'var(--brand-mark-mint)';

  return (
    <span className="dg-brand-lockup">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="dg-brand-hex"
      >
        <path
          d="M20 2L35.588 11V29L20 38L4.412 29V11L20 2Z"
          fill={outerInk}
        />
        <path
          d="M20 6.5L31.691 13.25V26.75L20 33.5L8.309 26.75V13.25L20 6.5Z"
          fill={innerCutout}
        />
        <path
          d="M20 10.4L28.314 15.2V24.8L20 29.6L11.686 24.8V15.2L20 10.4Z"
          fill={accentFill}
        />
        <circle cx="20" cy="20" r="3.4" fill={centerFill} />
      </svg>

      {showWordmark && (
        <span className="dg-brand-wordmark-wrap">
          <span
            className="dg-brand-wordmark"
            style={inverted ? { color: '#ffffff' } : undefined}
          >
            <strong>Dream</strong>
            <span className={inverted ? 'dg-brand-mint-dark' : 'dg-brand-mint'}>
              Team
            </span>
          </span>
          {subtitle && (
            <span
              className="dg-brand-sub"
              style={
                inverted ? { color: 'rgba(255, 255, 255, 0.65)' } : undefined
              }
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
