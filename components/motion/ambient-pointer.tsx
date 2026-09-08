"use client";

import { useEffect } from "react";

/**
 * AmbientPointer — makes the atmospheric background gently follow the pointer.
 *
 * It writes two eased, normalised values (`--mx`, `--my` ≈ [-1, 1]) onto :root
 * each animation frame; the ambient layers in globals.css consume them via the
 * independent `translate` property, each with its own `--depth` multiplier and
 * the section's `--mf` strength — so the parallax is multi-layer and composes
 * with the breathing loop.
 *
 * Inertia: the rendered value lerps toward the pointer target (~7%/frame), so
 * the background lags and "catches up" — weightless, never 1:1, never jittery.
 * The rAF loop sleeps when settled (no perpetual frame loop → battery-friendly).
 *
 * Gating: disabled under `prefers-reduced-motion: reduce`. Fine pointers track
 * the mouse; coarse pointers fall back to device orientation IF delivered
 * without a permission prompt (Android) — iOS's gesture prompt is intentionally
 * NOT triggered, so touch devices simply keep the CSS auto-float. Renders nothing.
 */
export function AmbientPointer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const EASE = 0.07;
    let cx = 0;
    let cy = 0; // current (eased)
    let tx = 0;
    let ty = 0; // target
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      root.style.setProperty("--mx", cx.toFixed(4));
      root.style.setProperty("--my", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.0008 || Math.abs(ty - cy) > 0.0008) {
        raf = requestAnimationFrame(tick);
      } else {
        cx = tx;
        cy = ty;
        root.style.setProperty("--mx", cx.toFixed(4));
        root.style.setProperty("--my", cy.toFixed(4));
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      kick();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 40));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
      kick();
    };

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) {
      window.addEventListener("mousemove", onMove, { passive: true });
    } else if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", onOrient, { passive: true });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      root.style.removeProperty("--mx");
      root.style.removeProperty("--my");
    };
  }, []);

  return null;
}
