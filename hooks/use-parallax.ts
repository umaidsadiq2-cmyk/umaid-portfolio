"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle parallax: translates the element a small amount relative to its
 * distance from the viewport center as you scroll. rAF-throttled, transform-only
 * (no layout thrash), and fully disabled for reduced-motion users.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(factor = 0.06) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const delta = window.innerHeight / 2 - center;
      el.style.transform = `translate3d(0, ${(delta * factor).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [factor]);

  return ref;
}
