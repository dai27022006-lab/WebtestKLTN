'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ArrowUp } from '@/components/icons/DreamIcons';
import { useExperiment } from '@/state';

export function BackToTopProgress() {
  const pathname = usePathname();
  const { assignment, scenarioState, activeVariant, isScenarioSynced } =
    useExperiment();
  const [visible, setVisible] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const lastScrollRef = useRef(0);

  const isAdminRoute = pathname.startsWith('/admin');
  const isSurveyActive = Boolean(
    assignment?.consent_given &&
      scenarioState?.scenario_run_id &&
      !scenarioState.is_finished
  );
  const isSyncingSurvey = Boolean(assignment && !isScenarioSynced);
  const isChatFabVisible =
    !isAdminRoute &&
    !isSyncingSurvey &&
    (!isSurveyActive || activeVariant === 'chatbot_on');

  useEffect(() => {
    if (typeof window === 'undefined' || isAdminRoute) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        maxScroll > 0
          ? Math.max(0, Math.min(100, Math.round((scrollY / maxScroll) * 100)))
          : 0;
      setScrollPct(pct);

      const isMobileOrTablet = window.matchMedia('(max-width: 991px)').matches;
      const scrollingUp = scrollY < lastScrollRef.current - 4;
      const pastThreshold = scrollY >= 380;

      if (isMobileOrTablet) {
        if (!pastThreshold) {
          setVisible(false);
        } else if (scrollingUp) {
          setVisible(true);
        } else if (scrollY > lastScrollRef.current + 6) {
          setVisible(false);
        }
      } else {
        setVisible(pastThreshold);
      }

      lastScrollRef.current = scrollY;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(update);
      }
    };

    rafId = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return null;
  }

  const handleBackToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      aria-label={`Cuộn về đầu trang (${scrollPct}%)`}
      title={`Về đầu trang (${scrollPct}%)`}
      className={`dg-back-to-top ${visible ? 'show' : ''} ${
        isChatFabVisible ? 'is-chat-offset' : ''
      }`}
      style={{ '--scroll-pct': scrollPct } as React.CSSProperties}
    >
      <span className="dg-back-to-top__ring" aria-hidden="true" />
      <span className="dg-back-to-top__inner" aria-hidden="true">
        <ArrowUp size={17} />
      </span>
    </button>
  );
}
