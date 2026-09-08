"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Custom cursor: a precise dot + a trailing ring that grows over interactive
 * elements. Only activates on fine pointers with motion allowed (touch and
 * reduced-motion users keep the native cursor). The native cursor is hidden via
 * html.has-cursor, which is added here only after the cursor is live — so no-JS
 * users are never left without a pointer.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 1 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const enter = () => ring.classList.add("is-active");
    const leave = () => ring.classList.remove("is-active");
    const targets = document.querySelectorAll<HTMLElement>(
      "a, button, [data-magnetic], [role='button'], input, textarea, select",
    );
    targets.forEach((t) => {
      t.addEventListener("mouseenter", enter);
      t.addEventListener("mouseleave", leave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      targets.forEach((t) => {
        t.removeEventListener("mouseenter", enter);
        t.removeEventListener("mouseleave", leave);
      });
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
