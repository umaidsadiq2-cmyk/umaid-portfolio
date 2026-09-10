"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { conversion } from "@/content/site";

/** The six disciplines, as the Section 2 marquee line. */
const DISCIPLINES = [
  "Social Media Marketing",
  "Meta Ads",
  "Graphic Design",
  "Video Editing",
  "AI Ads",
  "AI Development",
];

/**
 * The cinematic opening — Section 1 (Hero) and Section 2 (What I Do) rendered as
 * ONE continuous full-screen video scene.
 *
 * How the "fixed video" works: the video stage is `position: sticky` inside a
 * 200svh section, and the two text slides are pulled up over it with a negative
 * margin. Sticky (not fixed) is deliberate — it pins the video for exactly the
 * length of the section and then releases it naturally, so the video never
 * bleeds over My Services below, and it can't be broken by an ancestor that
 * creates a containing block. One <video> element, mounted once: it never
 * restarts, reloads, or swaps between the two sections.
 *
 * The two text slides sit in normal document flow (each one screen tall), so
 * without JS or under reduced motion both are fully readable and the headings
 * stay in the DOM for SEO. With motion allowed, GSAP scrubs a cross-fade between
 * them, so scrolling reads as the messaging changing over a stationary scene.
 *
 * The Section 1 copy rises in once on load (`data-hero-in`) — a short entrance
 * in place of the old full-screen brand curtain, which no longer exists.
 */
export function CinemaHero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Reduced motion: hold the video on its first frame and leave both slides
    // fully visible — no scrubbing, no cross-fade.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videoRef.current?.pause();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // The hero entrance (the copy rising in once on load) is a CSS animation
      // — see `[data-hero-in]` in globals.css — not GSAP. The headline is the
      // page's Largest Contentful Paint element: a JS `from({ opacity: 0 })`
      // hid it until the bundle had downloaded and hydrated, pushing LCP out by
      // seconds on mobile. CSS starts at first paint instead.

      // The section is two screens tall, so slide 2 is naturally centred at 50%
      // of it. The cross-fade is timed against that: slide 1 is gone by 34% and
      // slide 2 is fully lit by 50% — exactly when it comes to rest on screen.
      gsap.to(".cinema-s1", {
        opacity: 0,
        y: -70,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "34% top",
          scrub: 0.6,
        },
      });

      gsap.fromTo(
        ".cinema-s2",
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "24% top",
            end: "50% top",
            scrub: 0.6,
          },
        },
      );

      // A slow push-in on the footage itself, so the "held" scene still breathes.
      gsap.fromTo(
        ".cinema-video",
        { scale: 1.06 },
        {
          scale: 1.14,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }, root);

    // ---- Pointer spotlight ---------------------------------------------
    // Skipped on touch and coarse pointers, where there is no cursor to track.
    const light = glowRef.current;
    const stage = stageRef.current;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const teardown: Array<() => void> = [];

    if (light && stage && finePointer) {
      light.classList.remove("hidden");

      const ring = light.querySelector<HTMLElement>("[data-light='ring']")!;
      const dot = light.querySelector<HTMLElement>("[data-light='dot']")!;
      const blooms = Array.from(
        light.querySelectorAll<HTMLElement>("[data-light='bloom']"),
      );
      const echoes = Array.from(
        light.querySelectorAll<HTMLElement>("[data-light='echo']"),
      );

      // Centre every layer on its own coordinates, so x/y is the cursor itself.
      gsap.set([ring, dot, ...blooms, ...echoes], {
        xPercent: -50,
        yPercent: -50,
      });
      gsap.set(echoes, { scale: 0.92 });

      // The dot is effectively pinned to the pointer and the ring is nearly
      // instant, so neither reads as lagging; the blooms and the two echoes are
      // progressively slower, which is what produces the trail.
      const followers = [
        { el: dot, d: 0.05 },
        { el: ring, d: 0.12 },
        ...blooms.map((el, i) => ({ el, d: 0.4 - i * 0.14 })),
        // Each echo lags a little more than the one before it.
        ...echoes.map((el, i) => ({ el, d: 0.26 + i * 0.16 })),
      ].map(({ el, d }) => ({
        x: gsap.quickTo(el, "x", { duration: d, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: d, ease: "power3" }),
      }));

      let idleTimer = 0;
      let awake = false;

      /*
       * Idle only dims the soft light — the ring and the dot stay lit, because
       * the dot IS the pointer here (the arrow is hidden) and must never fade
       * out from under the user. So the glow settles while the cursor stays
       * perfectly readable.
       */
      const setGlow = (v: number) =>
        gsap.to([...blooms, ...echoes], {
          opacity: v,
          duration: v > 0.5 ? 0.3 : 0.8,
          ease: "power2.out",
        });

      const onMove = (e: MouseEvent) => {
        for (const f of followers) {
          f.x(e.clientX);
          f.y(e.clientY);
        }
        if (!awake) {
          awake = true;
          gsap.to(light, { opacity: 1, duration: 0.3, ease: "power2.out" });
          setGlow(1);
        }
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(() => {
          awake = false;
          setGlow(0.45);
        }, 600);
      };
      const onLeave = () => {
        window.clearTimeout(idleTimer);
        awake = false;
        gsap.to(light, { opacity: 0, duration: 0.5, ease: "power2.out" });
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);

      /*
       * The hero cursor treatment is active only while the scene is actually on
       * screen, so every other section keeps the normal emerald cursor.
       *
       * Measured on scroll rather than with an IntersectionObserver on purpose:
       * the sticky stage comes to rest with its bottom edge exactly on the
       * viewport top, and an observer never fires again on that zero-height
       * overlap — which left the hero cursor stuck on for the rest of the page.
       * A direct rect check has no such edge case.
       */
      const htmlEl = document.documentElement;
      const syncZone = () => {
        const r = stage.getBoundingClientRect();
        const onScreen = r.bottom > 8 && r.top < window.innerHeight - 8;
        htmlEl.classList.toggle("hero-light", onScreen);
      };
      syncZone();
      window.addEventListener("scroll", syncZone, { passive: true });
      window.addEventListener("resize", syncZone);

      teardown.push(() => {
        window.clearTimeout(idleTimer);
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("scroll", syncZone);
        window.removeEventListener("resize", syncZone);
        htmlEl.classList.remove("hero-light");
      });
    }

    return () => {
      teardown.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} data-nav-dark-zone className="relative isolate">
      {/* ---- The stationary scene: video + constant black overlay ---- */}
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden bg-[#0b100e]"
      >
        <video
          ref={videoRef}
          className="cinema-video h-full w-full scale-[1.06] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/video/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Black overlay — one stack, identical across both sections.
            The footage swings from near-black to bright frames, so a flat wash
            alone lets white type wash out on the light ones. A soft radial
            darkens the middle, where all the copy sits, and a vertical gradient
            holds the navbar and the lower edge — the video still reads through,
            but the text never depends on which frame is on screen. */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.28)_45%,rgba(0,0,0,0)_75%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/40" />

        {/*
          Pointer spotlight — a warm ring with a soft bloom and two trailing
          echoes. The whole group is `mix-blend-screen` and sits ABOVE the
          darkening overlays, so it lifts the footage back out of shadow instead
          of painting a pale disc on top: the cursor reads as a light moving over
          the scene. It lives inside the sticky stage, so it is structurally
          clipped to the hero and can never appear over a section below, and it
          sits BELOW the text layer, so it cannot wash out the headline.
          Fine pointers with motion allowed only.
        */}
        <div
          ref={glowRef}
          aria-hidden
          className="cinema-light pointer-events-none absolute inset-0 hidden opacity-0 mix-blend-screen"
        >
          {/* Bloom — the wide area light the cursor casts on the scene. */}
          <div
            data-light="bloom"
            className="absolute left-0 top-0 h-[300px] w-[300px] rounded-full will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(255,247,228,0.55) 0%, rgba(255,232,186,0.30) 28%, rgba(255,216,152,0.12) 50%, rgba(255,255,255,0) 72%)",
            }}
          />
          {/* Halo — a tighter, hotter core hugging the ring. */}
          <div
            data-light="bloom"
            className="absolute left-0 top-0 h-[118px] w-[118px] rounded-full will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(255,250,238,0.55) 0%, rgba(255,238,200,0.30) 42%, rgba(255,255,255,0) 74%)",
            }}
          />
          {/* Trailing echoes — progressively slower and fainter, so quick moves
              leave a short comet of light behind the ring. */}
          <div
            data-light="echo"
            className="absolute left-0 top-0 h-[46px] w-[46px] rounded-full border border-[rgba(255,236,205,0.28)] will-change-transform"
            style={{ boxShadow: "0 0 12px rgba(255,222,170,0.20)" }}
          />
          <div
            data-light="echo"
            className="absolute left-0 top-0 h-[46px] w-[46px] rounded-full border border-[rgba(255,236,205,0.16)] will-change-transform"
            style={{ boxShadow: "0 0 14px rgba(255,222,170,0.12)" }}
          />
          {/* The ring itself — thin, warm, glowing hard inside and out. */}
          <div
            data-light="ring"
            className="absolute left-0 top-0 h-[46px] w-[46px] rounded-full border-[1.5px] border-[rgba(255,250,238,0.97)] will-change-transform"
            style={{
              boxShadow:
                "0 0 11px rgba(255,240,205,0.92), 0 0 24px rgba(255,222,165,0.55), 0 0 46px rgba(255,206,130,0.28), inset 0 0 12px rgba(255,242,212,0.40)",
            }}
          />
          {/* The pointer itself — a small glowing dot at the centre of the ring,
              standing in for the arrow cursor, which is hidden in the hero. */}
          <div
            data-light="dot"
            className="absolute left-0 top-0 h-[6px] w-[6px] rounded-full bg-[rgba(255,253,247,1)] will-change-transform"
            style={{
              boxShadow:
                "0 0 6px rgba(255,244,215,0.95), 0 0 14px rgba(255,226,175,0.7), 0 0 26px rgba(255,210,140,0.35)",
            }}
          />
        </div>
      </div>

      {/* ---- The messaging, pulled up over the held scene ---- */}
      <div className="relative z-10 -mt-[100svh]">
        {/* Section 1 — Hero */}
        <div className="cinema-s1 flex h-svh flex-col items-center justify-center px-6 text-center">
          <h1 className="flex flex-col items-center">
            <span
              data-hero-in
              style={{ "--hero-delay": "0.15s" } as React.CSSProperties}
              className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-white/70 md:text-xs"
            >
              Muhammad Umaid Sadiq
            </span>
            <span
              data-hero-in
              style={{ "--hero-delay": "0.26s" } as React.CSSProperties}
              className="mt-6 block max-w-5xl font-display text-[clamp(2.75rem,8.5vw,7rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white"
            >
              Digital Marketing Expert
            </span>
          </h1>
          <p
            data-hero-in
            style={{ "--hero-delay": "0.37s" } as React.CSSProperties}
            className="mt-7 max-w-xl text-base leading-relaxed text-white/75 md:text-lg"
          >
            5+ Years of Experience in Digital Growth
          </p>
        </div>

        {/* Section 2 — What I Do */}
        <div className="cinema-s2 flex h-svh flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-white/70 md:text-xs">
            What I Do
          </p>
          <h2 className="mt-6 max-w-4xl font-display text-[clamp(1.9rem,4.6vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-white">
            Digital Marketing &amp; Creative Solutions for Business Growth.
          </h2>

          {/* The separator is the TRAILING child of each item, so when the line
              wraps it stays glued to the item before it — a wrapped line never
              opens with a stray bullet. */}
          <ul className="mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-y-1 text-sm text-white/80 md:text-[0.95rem]">
            {DISCIPLINES.map((item, i) => (
              <li key={item} className="flex items-center">
                {item}
                {i < DISCIPLINES.length - 1 && (
                  <span aria-hidden className="mx-3 text-white/35 md:mx-4">
                    •
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button href={conversion.bookingUrl} size="lg">
              Hire Me
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
