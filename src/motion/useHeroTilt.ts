'use client';

import { useEffect, useRef, type RefObject } from 'react';

export interface UseHeroTiltOptions<
  InteractionEl extends HTMLElement = HTMLElement,
> {
  interactionRef?: RefObject<InteractionEl | null>;
  forceMotion?: boolean;
}

const DESKTOP_TILT_MEDIA =
  '(hover: hover) and (pointer: fine) and (min-width: 992px) and (prefers-reduced-motion: no-preference)';

const DESKTOP_FORCED_TILT_MEDIA =
  '(hover: hover) and (pointer: fine) and (min-width: 992px)';

const TILT_CSS_VARS = [
  '--hero-rx',
  '--hero-ry',
  '--hero-px',
  '--hero-py',
] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clearTiltVars(el: HTMLElement | null): void {
  if (!el) return;
  for (const prop of TILT_CSS_VARS) {
    el.style.removeProperty(prop);
  }
}

export function useHeroTilt<
  ContainerEl extends HTMLElement = HTMLElement,
  TargetEl extends HTMLElement = HTMLElement,
  InteractionEl extends HTMLElement = HTMLElement,
>(options?: UseHeroTiltOptions<InteractionEl>) {
  const containerRef = useRef<ContainerEl | null>(null);
  const targetRef = useRef<TargetEl | null>(null);
  const interactionRef = options?.interactionRef;
  const forceMotion = options?.forceMotion === true;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container: HTMLElement | null = containerRef.current;
    const target: HTMLElement | null = targetRef.current;
    if (!container || !target) return;

    const interactionEl: HTMLElement = interactionRef?.current ?? container;
    const mq = window.matchMedia(
      forceMotion ? DESKTOP_FORCED_TILT_MEDIA : DESKTOP_TILT_MEDIA
    );

    let rafId = 0;
    let isListening = false;
    let rect = interactionEl.getBoundingClientRect();

    let targetRx = 0;
    let targetRy = 0;
    let targetPx = 0;
    let targetPy = 0;

    let currRx = 0;
    let currRy = 0;
    let currPx = 0;
    let currPy = 0;

    const writeCssVars = (rx: number, ry: number, px: number, py: number) => {
      const rxVal = `${rx.toFixed(3)}deg`;
      const ryVal = `${ry.toFixed(3)}deg`;
      const pxVal = px.toFixed(4);
      const pyVal = py.toFixed(4);

      container.style.setProperty('--hero-rx', rxVal);
      container.style.setProperty('--hero-ry', ryVal);
      container.style.setProperty('--hero-px', pxVal);
      container.style.setProperty('--hero-py', pyVal);

      if (target !== container) {
        target.style.setProperty('--hero-rx', rxVal);
        target.style.setProperty('--hero-ry', ryVal);
        target.style.setProperty('--hero-px', pxVal);
        target.style.setProperty('--hero-py', pyVal);
      }
    };

    const updateRect = () => {
      rect = interactionEl.getBoundingClientRect();
    };

    const step = () => {
      rafId = 0;
      const ease = 0.14;
      currRx += (targetRx - currRx) * ease;
      currRy += (targetRy - currRy) * ease;
      currPx += (targetPx - currPx) * ease;
      currPy += (targetPy - currPy) * ease;

      const settled =
        Math.abs(targetRx - currRx) < 0.01 &&
        Math.abs(targetRy - currRy) < 0.01 &&
        Math.abs(targetPx - currPx) < 0.002 &&
        Math.abs(targetPy - currPy) < 0.002;

      if (settled) {
        currRx = targetRx;
        currRy = targetRy;
        currPx = targetPx;
        currPy = targetPy;
        writeCssVars(currRx, currRy, currPx, currPy);
        return;
      }

      writeCssVars(currRx, currRy, currPx, currPy);
      rafId = requestAnimationFrame(step);
    };

    const ensureLoop = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(step);
      }
    };

    const onMouseEnter = () => {
      updateRect();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (rect.width <= 0 || rect.height <= 0) {
        updateRect();
      }
      if (rect.width <= 0 || rect.height <= 0) return;

      const relX = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
      const relY = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

      targetRy = clamp(relX * 10, -5.5, 5.5);
      targetRx = clamp(relY * -10, -5.5, 5.5);
      targetPx = relX * 2;
      targetPy = relY * 2;

      ensureLoop();
    };

    const onMouseLeave = () => {
      targetRx = 0;
      targetRy = 0;
      targetPx = 0;
      targetPy = 0;
      ensureLoop();
    };

    const stopTilt = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      targetRx = 0;
      targetRy = 0;
      targetPx = 0;
      targetPy = 0;
      currRx = 0;
      currRy = 0;
      currPx = 0;
      currPy = 0;

      if (isListening) {
        interactionEl.removeEventListener('mouseenter', onMouseEnter);
        interactionEl.removeEventListener('mousemove', onMouseMove);
        interactionEl.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
        isListening = false;
      }

      clearTiltVars(container);
      if (target !== container) {
        clearTiltVars(target);
      }
      target.style.transform = '';
    };

    const startTilt = () => {
      if (isListening) return;
      updateRect();
      interactionEl.addEventListener('mouseenter', onMouseEnter, {
        passive: true,
      });
      interactionEl.addEventListener('mousemove', onMouseMove, {
        passive: true,
      });
      interactionEl.addEventListener('mouseleave', onMouseLeave, {
        passive: true,
      });
      window.addEventListener('resize', updateRect, { passive: true });
      window.addEventListener('scroll', updateRect, { passive: true });
      isListening = true;
    };

    const syncMedia = () => {
      if (mq.matches) {
        startTilt();
      } else {
        stopTilt();
      }
    };

    syncMedia();
    mq.addEventListener('change', syncMedia);

    return () => {
      mq.removeEventListener('change', syncMedia);
      stopTilt();
    };
  }, [interactionRef, forceMotion]);

  return { containerRef, targetRef };
}
