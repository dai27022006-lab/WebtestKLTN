'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useExperiment } from '@/state';

export function PageViewTracker() {
  const pathname = usePathname();
  const { assignment, track } = useExperiment();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!assignment) return;
    const key = `${assignment.assignment_id}:${pathname}`;
    if (lastTrackedRef.current === key) return;
    lastTrackedRef.current = key;

    void track('page_viewed', {
      properties: { path: pathname },
    });
  }, [assignment, pathname, track]);

  return null;
}
