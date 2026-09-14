"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

    // Keep ScrollTrigger in sync with Lenis' smoothed scroll position.
    lenis.on("scroll", ScrollTrigger.update);

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

    /*
     * A mouse press halts any smoothing still in flight. Lenis keeps easing the
     * page for about a second after the wheel stops (longer with a trackpad's
     * momentum), so a button could slide out from under the pointer between
     * press and release, and the browser then drops the click. Stopping on the
     * press, like native scrolling does, keeps the target where the user aimed.
     * stop() resets the animation to the current position; start() re-enables
     * scrolling immediately.
     */
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !lenis.isScrolling) return;
      lenis.stop();
      lenis.start();
    };
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      lenis.destroy();
    };
  }, []);

  return null;
}
