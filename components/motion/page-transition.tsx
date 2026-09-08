"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * Cinematic "luxury doors" page transition. Lives in the root layout, which
 * persists across App Router navigations — so it can run an exit animation BEFORE
 * the route changes and an entrance animation AFTER, something the App Router
 * has no native hook for.
 *
 * Flow on internal link click (intercepted in the capture phase, before Next's
 * <Link> handler): two white panels slide in from the edges and meet at centre →
 * the screen is covered → router.push() loads the destination (Next has usually
 * prefetched it) → once the new route commits, the panels split back open while
 * the new page scales 0.97 → 1 with a soft opacity lift.
 *
 * Progressive enhancement: links stay real <a href> (SSR/crawlable); this only
 * enhances the click. Disabled under reduced motion (normal navigation). Panels
 * are aria-hidden, fixed (no layout shift), GPU-animated (transform/opacity only).
 */
type Phase = "idle" | "closing" | "covered" | "opening";

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const phase = useRef<Phase>("idle");
  const coveredAt = useRef(0);
  const safety = useRef<number | undefined>(undefined);

  const setPanels = (v: gsap.TweenVars) =>
    gsap.set([leftRef.current, rightRef.current], v);

  const openDoors = () => {
    if (phase.current === "opening" || phase.current === "idle") return;
    phase.current = "opening";
    const main = document.getElementById("main");
    const tl = gsap.timeline({
      onComplete: () => {
        phase.current = "idle";
        setPanels({ pointerEvents: "none", willChange: "auto" });
        if (main) gsap.set(main, { clearProps: "transform,opacity,willChange" });
      },
    });
    tl.to(leftRef.current, { xPercent: 0, duration: 0.5, ease: "power3.inOut" }, 0)
      .to(rightRef.current, { xPercent: 0, duration: 0.5, ease: "power3.inOut" }, 0);
    if (main) {
      tl.fromTo(
        main,
        { scale: 0.97, opacity: 0.5, transformOrigin: "50% 50%", willChange: "transform,opacity" },
        { scale: 1, opacity: 1, duration: 0.58, ease: "power3.out" },
        0.06,
      );
    }
  };

  const closeDoors = (href: string) => {
    phase.current = "closing";
    setPanels({ pointerEvents: "auto", willChange: "transform" });
    gsap
      .timeline({
        onComplete: () => {
          phase.current = "covered";
          coveredAt.current = performance.now();
          router.push(href);
          // Fallback: if the route never commits, open anyway.
          safety.current = window.setTimeout(() => {
            if (phase.current === "covered") openDoors();
          }, 2500);
        },
      })
      .to(leftRef.current, { xPercent: 100, duration: 0.42, ease: "power3.inOut" }, 0)
      .to(rightRef.current, { xPercent: -100, duration: 0.42, ease: "power3.inOut" }, 0);
  };

  // Panels are parked off-screen via left/right CSS (no transform), so hidden is
  // xPercent 0 — no conflicting inline transform for GSAP to double up on.
  useEffect(() => {
    setPanels({ xPercent: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the route commits while covered, open the doors (after a min cover time).
  useEffect(() => {
    if (phase.current !== "covered") return;
    if (safety.current) {
      clearTimeout(safety.current);
      safety.current = undefined;
    }
    const elapsed = performance.now() - coveredAt.current;
    const wait = Math.max(0, 200 - elapsed);
    const t = window.setTimeout(openDoors, wait);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Intercept internal link clicks.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      const path = (e.composedPath?.() ?? []) as EventTarget[];
      let a: HTMLAnchorElement | null = null;
      for (const el of path) {
        if (el instanceof HTMLAnchorElement) {
          a = el;
          break;
        }
      }
      if (!a) a = (e.target as HTMLElement | null)?.closest?.("a") ?? null;
      if (!a) return;

      const href = a.getAttribute("href");
      if (
        !href ||
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        (a.getAttribute("rel") ?? "").includes("external")
      )
        return;

      let url: URL;
      try {
        url = new URL(href, location.origin);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return; // external
      if (url.pathname === pathname) return; // same page (e.g. hash) → default

      e.preventDefault();
      e.stopPropagation();
      if (phase.current !== "idle") return; // already transitioning
      closeDoors(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[400]">
      <div
        ref={leftRef}
        data-door="left"
        className="absolute inset-y-0 bg-white"
        style={{ width: "51vw", left: "-51vw" }}
      />
      <div
        ref={rightRef}
        data-door="right"
        className="absolute inset-y-0 bg-white"
        style={{ width: "51vw", right: "-51vw" }}
      />
    </div>
  );
}
