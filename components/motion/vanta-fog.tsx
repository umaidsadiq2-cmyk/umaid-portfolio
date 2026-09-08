"use client";

import { useEffect, useRef } from "react";

/**
 * VantaFog — the hero's living atmosphere, powered by Vanta.js' FOG effect
 * (WebGL via three.js). Soft, drifting sage-green/white fog that reacts to the
 * pointer, matching the design reference.
 *
 * Performance: three.js + the effect are loaded with a dynamic import INSIDE the
 * effect, so they're code-split into a separate async chunk (kept out of the
 * initial First Load JS, fetched after the hero mounts). It's gated off for
 * `prefers-reduced-motion: reduce`, and the instance is destroyed on unmount.
 *
 * The mount div is `aria-hidden` and sits behind the hero content via CSS
 * (`.vanta-fog`, z-index below content), so it never affects layout, the
 * portrait, headings, CTAs, or SEO.
 */
export function VantaFog() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let effect: { destroy: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const THREE = await import("three");
      const FOG = (await import("vanta/dist/vanta.fog.min")).default;
      if (cancelled || !ref.current) return;
      effect = FOG({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        // Clean white atmosphere — white base with soft light-gray cloud tones.
        baseColor: 0xffffff,
        highlightColor: 0xffffff,
        midtoneColor: 0xeef0f1,
        lowlightColor: 0xdadee0,
        blurFactor: 0.66,
        speed: 1.0,
        zoom: 0.9,
      });
    })();

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return <div ref={ref} aria-hidden className="vanta-fog" />;
}
