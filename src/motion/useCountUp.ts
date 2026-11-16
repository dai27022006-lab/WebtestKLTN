'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target: number, durationMs = 1100, decimals = 0) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState<string>(
    decimals > 0 ? target.toFixed(decimals) : String(Math.round(target))
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const format = (val: number) =>
      decimals > 0 ? val.toFixed(decimals) : String(Math.round(val));

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      return;
    }

    let frameId = 0;
    let started = false;

    const startAnimation = () => {
      if (started) return;
      started = true;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setDisplayValue(format(current));
        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          setDisplayValue(format(target));
        }
      };

      setDisplayValue(format(0));
      frameId = requestAnimationFrame(tick);
    };

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.96) {
      startAnimation();
      return () => {
        if (frameId) cancelAnimationFrame(frameId);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [target, durationMs, decimals]);

  return { ref, displayValue };
}
