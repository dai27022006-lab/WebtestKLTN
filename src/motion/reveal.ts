export function initScrollReveals(root: Document | Element = document): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const elements = Array.from(
    root.querySelectorAll<HTMLElement>('.editorial-reveal')
  );

  if (elements.length === 0) {
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    for (const el of elements) {
      el.dataset.revealState = 'visible';
    }
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.dataset.revealState = 'visible';
          observer.unobserve(target);
        }
      }
    },
    {
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.01,
    }
  );

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.94) {
      el.dataset.revealState = 'visible';
    } else {
      el.dataset.revealState = 'pending';
      observer.observe(el);
    }
  }

  return () => {
    observer.disconnect();
  };
}
