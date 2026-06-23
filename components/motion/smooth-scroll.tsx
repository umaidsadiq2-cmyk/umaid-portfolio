"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Premium smooth scrolling (Lenis). Mounts once at the root. Fully bypassed when
 * the user prefers reduced motion — native scrolling stays intact and accessible.
 * Pauses its rAF loop when the tab is hidden to avoid wasted work.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
      } else {
        frame = requestAnimationFrame(raf);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      lenis.destroy();
    };
  }, []);

  return null;
}
