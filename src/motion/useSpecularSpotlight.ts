'use client';

import { useEffect, useRef, type RefObject } from 'react';

const SPOTLIGHT_MEDIA_QUERY =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export interface UseSpecularSpotlightOptions {
  selector?: string;
  disabled?: boolean;
}

export function useSpecularSpotlight<T extends HTMLElement = HTMLElement>(
  options?: UseSpecularSpotlightOptions
): RefObject<T | null> {
  const containerRef = useRef<T | null>(null);
  const selector = options?.selector ?? '.dg-spotlight-card';
  const disabled = options?.disabled === true;

  useEffect(() => {
    if (typeof window === 'undefined' || disabled) return;
    const root = containerRef.current;
    if (!root) return;

    const mq = window.matchMedia(SPOTLIGHT_MEDIA_QUERY);
    const cleanups = new Map<HTMLElement, () => void>();
    let mutationObserver: MutationObserver | null = null;

    const bindCard = (card: HTMLElement) => {
      if (cleanups.has(card)) return;

      let rect: DOMRect | null = null;
      let rafId = 0;
      let lastX = 0;
      let lastY = 0;
      let isHovering = false;

      const flushCoords = () => {
        rafId = 0;
        if (!isHovering) return;
        if (!rect) {
          rect = card.getBoundingClientRect();
        }
        if (rect.width <= 0 || rect.height <= 0) return;

        const x = lastX - rect.left;
        const y = lastY - rect.top;
        card.style.setProperty('--mx', `${x.toFixed(1)}px`);
        card.style.setProperty('--my', `${y.toFixed(1)}px`);
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        isHovering = true;
        rect = card.getBoundingClientRect();
        lastX = event.clientX;
        lastY = event.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(flushCoords);
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        isHovering = true;
        lastX = event.clientX;
        lastY = event.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(flushCoords);
        }
      };

      const resetSpotlight = () => {
        isHovering = false;
        rect = null;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      };

      const invalidateRect = () => {
        if (isHovering) {
          rect = null;
        }
      };

      card.addEventListener('pointerenter', onPointerEnter, { passive: true });
      card.addEventListener('pointermove', onPointerMove, { passive: true });
      card.addEventListener('pointerleave', resetSpotlight, { passive: true });
      card.addEventListener('pointercancel', resetSpotlight, { passive: true });
      window.addEventListener('scroll', invalidateRect, { passive: true });
      window.addEventListener('resize', invalidateRect, { passive: true });

      cleanups.set(card, () => {
        resetSpotlight();
        card.removeEventListener('pointerenter', onPointerEnter);
        card.removeEventListener('pointermove', onPointerMove);
        card.removeEventListener('pointerleave', resetSpotlight);
        card.removeEventListener('pointercancel', resetSpotlight);
        window.removeEventListener('scroll', invalidateRect);
        window.removeEventListener('resize', invalidateRect);
      });
    };

    const syncTargets = () => {
      const nextCards = new Set<HTMLElement>();
      if (root.matches(selector)) {
        nextCards.add(root);
      }
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        nextCards.add(el);
      });

      for (const [card, cleanup] of cleanups.entries()) {
        if (!nextCards.has(card)) {
          cleanup();
          cleanups.delete(card);
        }
      }

      for (const card of nextCards) {
        bindCard(card);
      }
    };

    const teardownAll = () => {
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      for (const cleanup of cleanups.values()) {
        cleanup();
      }
      cleanups.clear();
    };

    const syncMedia = () => {
      if (mq.matches) {
        syncTargets();
        if (!mutationObserver && typeof MutationObserver !== 'undefined') {
          mutationObserver = new MutationObserver(() => {
            syncTargets();
          });
          mutationObserver.observe(root, { childList: true });
        }
      } else {
        teardownAll();
      }
    };

    syncMedia();
    mq.addEventListener('change', syncMedia);

    return () => {
      mq.removeEventListener('change', syncMedia);
      teardownAll();
    };
  }, [selector, disabled]);

  return containerRef;
}
