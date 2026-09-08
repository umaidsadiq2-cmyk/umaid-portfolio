"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Cinematic scroll-motion engine (GSAP + ScrollTrigger). Driven by `data-*` hooks:
 *
 *   data-anim="split"      headings split into words that ride up from a mask
 *   data-anim="reveal"     content wipes up behind a clip (not a fade)
 *   data-anim="card"       portfolio cards slide in horizontally (alternating)
 *   data-anim="img-left"   image: clip-from-left + scale + motion-blur reveal
 *   data-anim="img-right"  image: clip-from-right + scale + motion-blur reveal
 *   data-anim="float"      gentle continuous float
 *   data-parallax="0.1"    scroll-linked vertical drift (scrubbed)
 *   data-tilt              parallax tilt toward the cursor (within its section)
 *   data-magnetic          element is pulled toward the cursor, springs back
 *
 * Disabled entirely under prefers-reduced-motion (markup already visible via CSS).
 * Re-scans on route change. Pointer interactions only bind on fine pointers.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const delayOf = (el: Element) => {
      const v = el.getAttribute("data-anim-delay");
      const n = v ? parseFloat(v) : NaN;
      return Number.isFinite(n) ? n / 1000 : 0;
    };

    // Split an element's text into masked per-character spans, preserving nested
    // markup (e.g. an inline emerald <span>) and word boundaries (spaces stay
    // real text nodes, so headings still wrap). Returns the inner char elements.
    const splitChars = (el: HTMLElement): HTMLElement[] => {
      if (el.dataset.splitDone !== "1") {
        const walk = (node: Node) => {
          Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent ?? "";
              if (!text) return;
              const frag = document.createDocumentFragment();
              // Split into words; keep each word's characters together (the word
              // wrapper is nowrap) so lines only ever break at real spaces.
              text.split(/(\s+)/).forEach((token) => {
                if (!token) return;
                if (!token.trim()) {
                  frag.appendChild(document.createTextNode(token));
                  return;
                }
                const word = document.createElement("span");
                word.className = "split-word";
                for (const ch of token) {
                  const mask = document.createElement("span");
                  mask.className = "word-mask";
                  const inner = document.createElement("span");
                  inner.className = "word-inner";
                  inner.textContent = ch;
                  mask.appendChild(inner);
                  word.appendChild(mask);
                }
                frag.appendChild(word);
              });
              node.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              walk(child);
            }
          });
        };
        walk(el);
        el.dataset.splitDone = "1";
      }
      return Array.from(el.querySelectorAll<HTMLElement>(".word-inner"));
    };

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-anim='split']").forEach((el) => {
        const chars = splitChars(el);
        gsap.set(el, { autoAlpha: 1 });
        if (!chars.length) return;
        gsap.set(chars, { yPercent: 130 });
        gsap.to(chars, {
          yPercent: 0,
          duration: 0.85,
          ease: "back.out(1.7)", // overshoot bounce for a playful, eye-catching reveal
          stagger: 0.028,
          delay: delayOf(el),
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-anim='reveal']").forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)", y: 44, autoAlpha: 0 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            delay: delayOf(el),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-anim='card']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: i % 2 === 0 ? -90 : 90, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          },
        );
      });

      (
        [
          ["img-left", -100],
          ["img-right", 100],
        ] as const
      ).forEach(([name, fromX]) => {
        gsap.utils.toArray<HTMLElement>(`[data-anim='${name}']`).forEach((el) => {
          // x:0 pinned in both states so GSAP fully owns the transform and the
          // CSS translateX(-100%) seed can't leave a leftover pixel offset.
          gsap.fromTo(
            el,
            { xPercent: fromX, x: 0 },
            {
              xPercent: 0,
              x: 0,
              duration: 1.25,
              ease: "power4.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-anim='float']").forEach((el) => {
        gsap.to(el, {
          y: "+=18",
          duration: 3.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const f = parseFloat(el.getAttribute("data-parallax") || "") || 0.12;
        gsap.fromTo(
          el,
          { yPercent: -f * 100 },
          {
            yPercent: f * 100,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });

    if (finePointer) {
      // Cursor-parallax tilt (hero portrait): the element leans toward the cursor.
      gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((el) => {
        gsap.set(el, { transformPerspective: 900, transformOrigin: "center" });
        const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
        const rxTo = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3" });
        const ryTo = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3" });
        const area = el.closest("section") ?? el;
        const onMove = (e: Event) => {
          const m = e as MouseEvent;
          const r = el.getBoundingClientRect();
          const dx = (m.clientX - (r.left + r.width / 2)) / r.width;
          const dy = (m.clientY - (r.top + r.height / 2)) / r.height;
          xTo(dx * 22);
          yTo(dy * 22);
          ryTo(dx * 7);
          rxTo(-dy * 7);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
          rxTo(0);
          ryTo(0);
        };
        area.addEventListener("mousemove", onMove);
        area.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          area.removeEventListener("mousemove", onMove);
          area.removeEventListener("mouseleave", onLeave);
        });
      });

      // Magnetic buttons.
      gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
        const onMove = (e: Event) => {
          const m = e as MouseEvent;
          const r = el.getBoundingClientRect();
          xTo((m.clientX - (r.left + r.width / 2)) * 0.35);
          yTo((m.clientY - (r.top + r.height / 2)) * 0.45);
        };
        const onLeave = () => {
          xTo(0);
          yTo(0);
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
