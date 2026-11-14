'use client';

import { useEffect, useState } from 'react';

export function useElapsedTimer(startedAt: string | null | undefined): number {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!startedAt) {
      const resetId = setTimeout(() => setElapsedSeconds(0), 0);
      return () => clearTimeout(resetId);
    }

    const startMs = new Date(startedAt).getTime();
    if (!Number.isFinite(startMs)) {
      return undefined;
    }

    const compute = () => Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    const immediateId = setTimeout(() => setElapsedSeconds(compute()), 0);
    const intervalId = setInterval(() => {
      setElapsedSeconds(compute());
    }, 1000);

    return () => {
      clearTimeout(immediateId);
      clearInterval(intervalId);
    };
  }, [startedAt]);

  return elapsedSeconds;
}
