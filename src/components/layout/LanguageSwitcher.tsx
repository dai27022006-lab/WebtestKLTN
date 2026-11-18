'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Check, ChevronDown, Globe } from '@/components/icons/DreamIcons';
import { useLocale } from '@/components/providers/LocaleProvider';
import { APP_LOCALES, LOCALE_META } from '@/lib/i18n';

interface LanguageSwitcherProps {
  /** 'compact' = button + floating popover (header/admin topbar); 'inline' = full pill row inside mobile drawers */
  variant?: 'compact' | 'inline';
  align?: 'right' | 'left';
  onSelectLocale?: () => void;
}

export function LanguageSwitcher({
  variant = 'compact',
  align = 'right',
  onSelectLocale,
}: LanguageSwitcherProps) {
  const { locale, setLocale, chrome } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open || variant !== 'compact') return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, variant]);

  if (variant === 'inline') {
    return (
      <div className="dg-lang-inline" role="group" aria-label={chrome.language.menuLabel}>
        <span className="dg-lang-inline-label">
          <Globe size={14} aria-hidden="true" />
          <span>{chrome.language.menuLabel}</span>
        </span>
        <div className="dg-lang-inline-grid">
          {APP_LOCALES.map((code) => {
            const info = LOCALE_META[code];
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                className={`dg-lang-chip ${active ? 'is-active' : ''}`}
                aria-pressed={active}
                onClick={() => {
                  setLocale(code);
                  onSelectLocale?.();
                }}
              >
                <span className="dg-lang-chip-code">{info.shortLabel}</span>
                <span className="dg-lang-chip-name">{info.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="dg-lang-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`dg-lang-btn ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={chrome.language.buttonAria}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Globe size={15} aria-hidden="true" />
        <span className="dg-lang-code">{LOCALE_META[locale].shortLabel}</span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={`dg-lang-chevron ${open ? 'is-rotated' : ''}`}
        />
      </button>

      {open ? (
        <div
          id={popoverId}
          className={`dg-lang-popover ${align === 'left' ? 'align-left' : 'align-right'}`}
          role="group"
          aria-label={chrome.language.menuLabel}
        >
          <p className="dg-lang-popover-title">{chrome.language.menuLabel}</p>
          <div className="dg-lang-options">
            {APP_LOCALES.map((code) => {
              const info = LOCALE_META[code];
              const active = locale === code;
              return (
                <button
                  key={code}
                  type="button"
                  className={`dg-lang-option ${active ? 'is-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                    onSelectLocale?.();
                  }}
                >
                  <span className="dg-lang-option-code">{info.shortLabel}</span>
                  <span className="dg-lang-option-native">{info.nativeName}</span>
                  {active ? (
                    <Check size={14} aria-hidden="true" className="dg-lang-option-check" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
