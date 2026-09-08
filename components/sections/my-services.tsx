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

    // Below 640px of viewport height a full-height pinned stage cannot hold the
    // heading and a 4:5 card at a sensible size, so the pin is skipped entirely
    // and the carousel stays a plain native scroller. This now runs at every
    // width (mobile included) — vertical scroll/swipe drives the horizontal
    // travel everywhere; only reduced-motion opts out.
    //
    // The height check itself is done ONCE, here, with a plain boolean rather
    // than as a live condition inside `mm.add`. gsap.matchMedia re-evaluates a
    // live query on every viewport resize — and on a phone, the address bar
    // collapsing mid-scroll fires exactly that kind of resize, which flipped
    // this query, reverted the pin, and rebuilt it while the user's finger
    // was still on the screen. That's what made the mobile carousel feel
    // broken: the interaction was restarting under the user's thumb. Reduced
    // motion is a real, static user preference and safe to leave live.
    const tallEnough = window.innerHeight >= 640;

    if (tallEnough) {
      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
         *   0 → 18%   SETTLE. The section is pinned and completely stationary.
         *             The heading and the first three cards are fully on screen
         *             and stable, so the section arrives and reads as a finished
         *             composition before anything slides.
         *  18 → 93%   TRAVEL. Cards 4–6 are drawn in. This phase is given exactly
         *             `distance` pixels of scroll, so the track moves 1:1 with the
         *             wheel and never races ahead of it.
         *  93 → 100%  REST. Held on the last three cards, so the carousel finishes
         *             on a settled frame rather than snapping straight into the
         *             next section.
         *
         * Total range is scaled by 1/TRAVEL so the travel phase keeps that 1:1
         * mapping regardless of how long the holds are.
         */
        const SETTLE = 0.18;
        const TRAVEL = 0.75;
        const REST = 1 - SETTLE - TRAVEL;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${Math.round(distance() / TRAVEL)}`,
            pin: true,
            scrub: 1,
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
      });
    }

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
      {/* min-h (not a fixed height): above 640px tall the cap below guarantees
          the content fits one screen exactly, and under that the pin is off and
          the section is free to grow instead of clipping its own cards. */}
      <div className="flex min-h-svh flex-col justify-center pb-16 pt-24 md:pb-4 md:pt-24">
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
        <div className="mx-auto mt-10 w-full max-w-[1600px] px-[var(--gutter)] md:mt-6">
          {/*
            Short-viewport handling. A card is always exactly one third of this
            box, so the box is what has to shrink when a third would be taller
            than the pinned screen — capping the CARD instead would leave slack
            in the row and let a fourth card slide into view.

            The cap is the widest container whose third, at 4:5, still fits the
            height left over once the navbar, heading and padding are subtracted
            (~325px of chrome, plus slack): width = 2.4 × leftover, i.e.
            240svh − 780px. Above roughly 900px tall it exceeds the container and
            does nothing.

            It is deliberately scoped to min-height 640px — the same cutoff the
            pin uses. Below that the section is NOT pinned and is free to grow
            past one screen, so squeezing the cards to fit a screen they no
            longer have to fit just made them needlessly small.
          */}
          <div className="mx-auto w-full md:max-w-[calc(160svh-378px)] lg:max-w-[calc(240svh-567px)]">
            <div
              ref={wrapRef}
              /* scroll-px matches the padding: without it, scroll-snap aligns
               cards to the padding EDGE and parks the track 12px to the left of
               the container. data-lenis-prevent: on mobile (where the pin
               above is switched off) this becomes a native swipeable
               scroller, but Lenis — mounted globally for the page's smooth
               vertical scroll — intercepts touch-drag everywhere by default
               and turns a horizontal swipe here into vertical page scroll
               instead. This attribute tells Lenis to leave touch input on
               this element alone so the native horizontal swipe actually
               works. */
              data-lenis-prevent
              className="-mx-3 snap-x snap-mandatory scroll-px-3 overflow-x-auto px-3 pb-12 pt-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
