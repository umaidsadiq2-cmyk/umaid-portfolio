"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type ServiceCard = {
  name: string;
  blurb: string;
  /** Slug of the matching dedicated service page, e.g. /services/{slug}. */
  slug: string;
  /**
   * Card artwork, from /public. Optional: a card without one falls back to the
   * original emerald numeral treatment, so the section always looks finished.
   * Anything roughly 4:5 (e.g. 1000×1250) works; it is cropped to fill.
   */
  image?: string;
};

/** The six offerings, in presentation order. */
const CARDS: ServiceCard[] = [
  {
    name: "Social Media Marketing",
    slug: "social-media-marketing",
    blurb:
      "Organic growth and community management that turn followers into a pipeline of paying customers.",
    image: "/images/services/social-media-marketing.webp",
  },
  {
    name: "Meta Ads",
    slug: "meta-ads",
    blurb:
      "Facebook and Instagram campaigns engineered for reach, ROAS, and genuinely qualified leads.",
    image: "/images/services/meta-ads.webp",
  },
  {
    name: "Graphic Design",
    slug: "graphic-design",
    blurb:
      "Posts, carousels, logos, and print built to one brand standard, so you look established from the first glance.",
    image: "/images/services/graphic-design.webp",
  },
  {
    name: "Video Editing",
    slug: "video-editing",
    blurb:
      "Reels and brand films cut for retention — pacing, captions, and motion that hold attention to the last frame.",
    image: "/images/services/video-editing.webp",
  },
  {
    name: "AI Ads",
    slug: "ai-ads",
    blurb:
      "AI-generated ad creative and UGC: more variations, produced faster, at a fraction of the usual cost.",
    image: "/images/services/ai-ads.webp",
  },
  {
    name: "AI Development",
    slug: "ai-development",
    blurb:
      "AI-assisted development of custom websites, CMS, ERP systems, dynamic websites, and complete business management software.",
    image: "/images/services/ai-development.webp",
  },
];

/**
 * Section 3 — My Services.
 *
 * A cinematic horizontal carousel: the section pins to the viewport and the card
 * track is scrubbed from right to left as the user scrolls vertically. `scrub: 1`
 * adds a one-second easing lag so the track glides rather than tracking the
 * wheel 1:1 — that lag is what makes it read as cinematic instead of mechanical.
 *
 * The pin runs on every viewport width, including mobile — vertical wheel or
 * touch scroll drives the horizontal travel there too, no horizontal drag
 * required. It is gated on viewport height (checked once at mount, not as a
 * live query — see the effect below for why) and allowed motion (live, via
 * `gsap.matchMedia`): below 640px tall, or with reduced motion on, the exact
 * same track falls back to a native horizontally-swipeable scroller with
 * scroll-snap — so the content and the interaction survive without the pin.
 * The wrapper only becomes `overflow: hidden` while the pinned version is
 * actually active.
 *
 * Palette is strictly white + #0B6E4F (the brand emerald) and its alphas.
 */
export function MyServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // useLayoutEffect (not useEffect): `pin: true` below makes ScrollTrigger
  // wrap this section in an extra "pin-spacer" DOM node the moment it mounts.
  // If a route change unmounts this component before that pin is reverted,
  // React tries to remove the section from the parent it originally rendered
  // it under — but the live DOM now has it nested inside the spacer instead,
  // so `removeChild` throws. Layout effect cleanups run synchronously during
  // unmount, before React detaches the DOM, so `mm.revert()` (which kills the
  // ScrollTrigger and un-wraps the spacer) always finishes first.
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers resize the *viewport* (not the screen) as the address
    // bar collapses/expands while scrolling. ScrollTrigger's own refresh
    // logic already knows to ignore that noise — this just switches it on.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const mm = gsap.matchMedia();

    /*
      Conditions are deliberately WIDTH- and preference-based only. There is no
      viewport-height condition here, and that is the whole point:

      - A height gate ("(min-height: 640px)", or a one-time
        `window.innerHeight >= 640`) silently disabled this pin on most phones.
        A phone reports an `innerHeight` of roughly 550–660px while the address
        bar is showing, so the gate failed, no pin was ever installed, and a
        mobile visitor scrolled straight past the carousel into the next
        section — exactly the reported bug.
      - Height conditions are also actively hostile on mobile even when they do
        pass: the address bar collapsing mid-scroll changes viewport height,
        which re-evaluates a live height query, reverts the pin and rebuilds it
        under the user's thumb.

      Width queries have neither problem — a phone's width does not change as
      the browser chrome hides — so the mobile/desktop split is safe to keep
      live, and it correctly rebuilds on an orientation change. Fitting the
      pinned stage into a short viewport is handled in CSS instead (see the
      svh-based cap on the carousel container below), which is the right layer
      for it: the layout adapts rather than the interaction disappearing.
    */
    mm.add(
      {
        isMobile: "(max-width: 767px)",
        canMove: "(prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { isMobile, canMove } = ctx.conditions as {
          isMobile: boolean;
          canMove: boolean;
        };
        // Reduced motion keeps the plain, natively-swipeable scroller.
        if (!canMove) return;

        const track = trackRef.current;
        const wrap = wrapRef.current;
        const section = sectionRef.current;
        if (!track || !wrap || !section) return;

        // The pinned version drives the track by transform, so the native
        // scroller must be switched off for the duration. Reset scrollLeft first:
        // any residual native/snap offset would otherwise be frozen in by
        // `overflow: hidden` and shift the whole carousel.
        const prevOverflow = wrap.style.overflowX;
        wrap.scrollLeft = 0;
        wrap.style.overflowX = "hidden";

        // The track is a block-level flex row filling the padded container, and
        // the cards overflow it — so its own scroll overflow IS the exact travel
        // needed to bring the last card fully into view. Measuring the track
        // rather than the wrapper keeps this independent of the wrapper's
        // padding. Recomputed on every refresh (resize / font load).
        const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

        /**
         * The pinned scroll is a timeline, not a bare tween, so it can hold still
         * at both ends:
         *
         *   SETTLE  The section is pinned and completely stationary. The heading
         *           and the first cards are fully on screen and stable, so the
         *           section arrives and reads as a finished composition before
         *           anything slides.
         *   TRAVEL  The remaining cards are drawn in. This phase is given exactly
         *           `distance` pixels of scroll, so the track moves 1:1 with the
         *           wheel and never races ahead of it.
         *   REST    Held on the last cards, so the carousel finishes on a settled
         *           frame rather than snapping straight into the next section.
         *
         * Total range is scaled by 1/TRAVEL so the travel phase keeps that 1:1
         * mapping regardless of how long the holds are.
         *
         * Mobile gets far shorter holds. On desktop an 18% opening hold is a
         * beat; on a phone the same fraction is several hundred pixels of
         * swiping with nothing visibly moving, which reads as the page being
         * stuck rather than as a deliberate pause. Cards there start moving
         * almost immediately, which is also what makes the locked section
         * legible as "scroll moves the cards" instead of "scroll is broken".
         */
        const SETTLE = isMobile ? 0.04 : 0.18;
        const TRAVEL = isMobile ? 0.92 : 0.75;
        const REST = 1 - SETTLE - TRAVEL;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round(distance() / TRAVEL)}`,
            pin: true,
            // A shorter scrub on touch: the 1s easing lag that reads as
            // cinematic behind a mouse wheel feels disconnected from a finger
            // that is still on the glass.
            scrub: isMobile ? 0.5 : 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(track, { x: 0, duration: SETTLE })
          .to(track, { x: () => -distance(), duration: TRAVEL })
          .to(track, { x: () => -distance(), duration: REST });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          wrap.style.overflowX = prevOverflow;
          gsap.set(track, { clearProps: "transform" });
        };
      },
    );

    /**
     * Pinning this section injects ~1000px of spacer height into the document.
     * A visitor arriving on `/#work` from another page has already been scrolled
     * to the anchor by the browser, using offsets measured BEFORE that spacer
     * existed — so they land roughly a screen short. Re-apply the hash once the
     * pin has been built and measured.
     */
    const hash = window.location.hash;
    const target = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
    const t = target
      ? window.setTimeout(() => {
          ScrollTrigger.refresh();
          target.scrollIntoView({ block: "start", behavior: "auto" });
        }, 300)
      : undefined;

    return () => {
      window.clearTimeout(t);
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative isolate scroll-mt-24 bg-canvas"
    >
      {/* pt clears the fixed navbar, which would otherwise sit over the eyebrow
          once this section is pinned to the top of the viewport. */}
      {/* min-h (not a fixed height): the caps below keep the content inside one
          screen at every size the pin runs at, so a pinned stage never hides
          the bottom of its own card. Mobile padding is tighter than desktop
          because every pixel of chrome here comes straight off the card. */}
      <div className="flex min-h-svh flex-col justify-center pb-10 pt-20 md:pb-4 md:pt-24">
        {/* Everything lives inside the page container, so the cards are inset by
            the same gutter as every other section and never reach the viewport
            edge. */}
        <div className="shell shell-wide shrink-0 text-center">
          <p className="eyebrow justify-center">My Services</p>
          <h2 className="display-lg mt-6 lg:whitespace-nowrap [@media(max-height:860px)]:mt-4 [@media(max-height:860px)]:text-[2.4rem]">
            Six ways I grow your business.
          </h2>
        </div>

        {/* The wrapper is the scroll viewport; the track fills its content box
            and the cards overflow it. The small negative margin + matching
            padding lets the hover glow bleed a little past the container edge
            before it is clipped, while staying inside the page gutter (so it can
            never cause horizontal page scroll). Vertical padding does the same
            for the hover lift. */}
        <div className="mx-auto mt-6 w-full max-w-[1600px] px-[var(--gutter)] md:mt-6">
          {/*
            Short-viewport handling. A card is always exactly one whole / half /
            third of this box, so the box is what has to shrink when a card
            would be taller than the pinned screen — capping the CARD instead
            would leave slack in the row and let an extra card slide into view.

            Each cap is the widest container whose card, at 4:5, still fits the
            height left over once the navbar, heading and padding are
            subtracted, i.e. width = (leftover height) × 4/5 × (cards per row).

              mobile  1 card:  (100svh − 360px) × 0.8
              md      2 cards: 160svh − 378px
              lg      3 cards: 240svh − 567px

            Each is a max-width only, so on a tall screen it exceeds the
            container and does nothing — the card simply grows to the normal
            full width. On a short one it shrinks the card just enough to keep
            the whole pinned composition on a single screen, which is what
            makes a locked section legible rather than clipped.
          */}
          <div className="mx-auto w-full max-w-[calc((100svh-360px)*0.8)] md:max-w-[calc(160svh-378px)] lg:max-w-[calc(240svh-567px)]">
            <div
              ref={wrapRef}
              /* scroll-px matches the padding: without it, scroll-snap aligns
               cards to the padding EDGE and parks the track 12px to the left of
               the container.

               Deliberately NO `data-lenis-prevent` here. It was added when
               mobile fell back to a native horizontal swipe, to stop Lenis
               swallowing that gesture — but mobile is now pinned like desktop,
               where the gesture that matters is a plain vertical scroll that
               ScrollTrigger reads off the page. On a phone this wrapper covers
               most of the pinned viewport, so telling Lenis to ignore input
               over it would suppress the very scroll the carousel runs on. The
               remaining fallback is reduced motion, and SmoothScroll already
               bails out entirely in that case, so Lenis is not running there
               to interfere. */
              className="-mx-3 snap-x snap-mandatory scroll-px-3 overflow-x-auto px-3 pb-8 pt-4 md:pb-12 md:pt-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div ref={trackRef} className="flex gap-6">
                {CARDS.map((card, i) => (
                  <Link
                    key={card.name}
                    href={`/services/${card.slug}`}
                    /* Exactly 1 / 2 / 3 cards fill the container width at mobile /
                   tablet / desktop, with a single shared gap. Width is driven
                   ONLY by the basis — no height cap — so a card is always
                   precisely one third and a fourth can never creep into view.
                   Short viewports are handled by narrowing the container
                   instead. Hover classes are unchanged. Each card links to its
                   own dedicated, SEO focused service page. */
                    className="group relative block shrink-0 basis-full snap-start overflow-hidden rounded-[1.5rem] border border-emerald/15 bg-white transition-[transform,box-shadow,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [aspect-ratio:4/5] hover:-translate-y-2.5 hover:border-emerald/60 hover:shadow-[0_36px_80px_-32px_rgba(11,110,79,0.55)] md:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-3rem)/3)]"
                  >
                    {/* Artwork, or the original numeral treatment when a card has
                        none. Either way it is the layer that zooms on hover, so
                        the interaction is identical for both. */}
                    {card.image ? (
                      <div aria-hidden className="pointer-events-none absolute inset-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={card.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full scale-100 object-cover blur-0 transition-[transform,filter] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.09] group-hover:blur-[3px]"
                        />
                        {/* Dark scrim: the copy sits at the bottom, so the image
                            is left clear at the top and deepened to black
                            behind the text, keeping the photo's own cinematic
                            tone instead of washing it out. Deepens further on
                            hover, where the description needs extra contrast. */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/20" />
                      </div>
                    ) : (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 origin-center scale-100 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.12]"
                      >
                        <div className="absolute -right-10 -top-12 select-none font-display text-[11rem] font-semibold leading-none tracking-tighter text-emerald/[0.07]">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="absolute -bottom-1/3 left-1/2 h-2/3 w-[130%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(11,110,79,0.16),rgba(11,110,79,0)_68%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                      </div>
                    )}

                    <div className="relative flex h-full flex-col justify-end p-6 md:p-8">
                      <div>
                        {/* hyphens/break-words: "AI Development" overflowed a
                            narrow card and was clipped by the rounded corner. */}
                        <h3
                          className={cn(
                            "origin-bottom-left hyphens-auto break-words font-display text-[1.65rem] font-semibold leading-[1.08] tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045] md:text-[2rem]",
                            card.image ? "text-white" : "text-emerald",
                          )}
                        >
                          {card.name}
                        </h3>

                        {/* Overlay content — animates its own height open, then the
                        copy fades and slides up inside it. */}
                        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr]">
                          <div className="overflow-hidden">
                            <p
                              className={cn(
                                "translate-y-3 pt-4 text-sm leading-relaxed opacity-0 transition-[transform,opacity] delay-100 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100",
                                card.image ? "text-white/85" : "text-emerald/80",
                              )}
                            >
                              {card.blurb}
                            </p>
                          </div>
                        </div>

                        {/* Read more affordance — the card itself is already the
                            link, so this is inert text, not a nested anchor. It
                            stays hidden until hover, same reveal as the blurb
                            above it. */}
                        <div
                          aria-hidden
                          className={cn(
                            "mt-5 flex translate-y-2 items-center gap-2 text-sm font-medium opacity-0 transition-[transform,opacity] delay-100 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100",
                            card.image ? "text-white" : "text-emerald",
                          )}
                        >
                          <span>Read more</span>
                          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
