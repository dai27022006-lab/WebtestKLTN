'use client';

import { useEffect, useState } from 'react';

function segmentGraphemes(input: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('vi', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(input), (item) => item.segment);
  }
  return Array.from(input);
}

export function useTypewriter(words: readonly string[]): {
  text: string;
  isReducedMotion: boolean;
} {
  const safeWords = words.length > 0 ? words : ['Web Bán Hàng'];
  const [text, setText] = useState<string>(safeWords[0]);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      const timer = setTimeout(() => {
        setIsReducedMotion(true);
        setText(safeWords[0]);
      }, 0);
      return () => clearTimeout(timer);
    }

    const graphemeWords = safeWords.map(segmentGraphemes);
    let wordIndex = 0;
    let charIndex = graphemeWords[0].length;
    let deleting = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let active = true;

    const schedule = (fn: () => void, ms: number) => {
      if (!active) return;
      timeoutId = setTimeout(fn, ms);
    };

    const tick = () => {
      if (!active) return;
      const currentChars = graphemeWords[wordIndex] ?? [];

      if (!deleting) {
        charIndex += 1;
        setText(currentChars.slice(0, charIndex).join(''));
        if (charIndex >= currentChars.length) {
          deleting = true;
          schedule(tick, 1700);
          return;
        }
        schedule(tick, 68);
      } else {
        charIndex -= 1;
        setText(currentChars.slice(0, Math.max(0, charIndex)).join(''));
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % graphemeWords.length;
          schedule(tick, 220);
          return;
        }
        schedule(tick, 34);
      }
    };

    // Start after brief pause showing initial full word (0ms instant visible hero)
    schedule(tick, 1800);

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { text, isReducedMotion };
}
