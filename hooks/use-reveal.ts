"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll via IntersectionObserver. Sets [data-reveal="in"] once the
 * element enters the viewport. CSS handles the transition and the reduced-motion
 * fallback (see globals.css .reveal). No animation library needed for the base case.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string; once?: boolean },
) {
  const ref = useRef<T>(null);
  const { threshold = 0.16, rootMargin = "0px 0px -10% 0px", once = true } =
    options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-reveal", "in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.removeAttribute("data-reveal");
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
}
