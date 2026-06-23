"use client";

import { useEffect, useRef } from "react";

/**
 * Signature element: the growth line.
 * A hairline emerald track pinned to the left edge that fills top→bottom with
 * scroll progress — "your growth, tracked." Quiet, on-brief, and near-free.
 * Uses rAF + a CSS transform (no layout thrash). Hidden for reduced-motion users
 * via the [data-reduced] guard, where it simply renders as a static full line.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      fill.style.transform = "scaleY(1)";
      return;
    }

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      fill.style.transform = `scaleY(${progress})`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 hidden h-screen w-px bg-line md:block"
    >
      <div
        ref={fillRef}
        className="h-full w-full origin-top bg-emerald"
        style={{ transform: "scaleY(0)" }}
      />
    </div>
  );
}
