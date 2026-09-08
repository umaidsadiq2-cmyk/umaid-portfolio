"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { headerNav, siteMeta } from "@/content/site";
import { BrandMark } from "@/components/shared/brand-mark";
import { cn } from "@/lib/utils";

/** Navbar height — the band that must clear a dark section. */
const NAV_H = 80;

/**
 * Minimal header: the two on-page section links sit on the left, and the US
 * mark is centred as the home link. Nothing else — no CTA, no mobile menu.
 * With only two short labels the same row works at every width, so there is no
 * hamburger to open. About and Contact live in the footer.
 *
 * The logo is absolutely centred rather than laid out in a middle column, so it
 * stays on the exact horizontal centre of the page no matter how wide the link
 * group on the left grows.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Defaults to true (white) rather than false: the home page always opens on
  // the dark hero, so a false-first render would flash emerald links over the
  // video for one frame before the layout effect below corrects it. Pages
  // with no dark zone still resolve to false before paint, via useLayoutEffect.
  const [overDark, setOverDark] = useState(true);
  const pathname = usePathname();

  /**
   * Any page may mark a full-bleed dark section with `data-nav-dark-zone` (the
   * home page's video scene does). While that section sits under the navbar
   * band, the navbar inverts to white and stays transparent — otherwise the
   * default near-black links would be invisible over the footage.
   *
   * useLayoutEffect (not useEffect) so this resolves before the browser
   * paints — otherwise a page without a dark zone would flash white first.
   */
  useLayoutEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const zone = document.querySelector<HTMLElement>("[data-nav-dark-zone]");
      if (!zone) {
        setOverDark(false);
        return;
      }
      const r = zone.getBoundingClientRect();
      setOverDark(r.top <= 0 && r.bottom > NAV_H);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled && !overDark
          ? "border-b border-line bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell shell-wide relative flex h-16 items-center md:h-20">
        {/*
          w-full + justify-between on mobile: with only two links and the logo
          absolutely centred over them, splitting the pair to the two edges
          reads as a proper header (one mark each side of the logo) instead of
          both links stacking to the left of it. From md up this reverts to a
          normal left-aligned, gapped group — the original desktop layout.
        */}
        <nav
          className="flex w-full items-center justify-between gap-6 md:w-auto md:justify-start md:gap-8"
          aria-label="Primary"
        >
          {headerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative text-sm transition-colors",
                overDark
                  ? "text-white/90 hover:text-white"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px w-0 transition-[width] duration-300 ease-out group-hover:w-full",
                  overDark ? "bg-white" : "bg-emerald",
                )}
              />
            </Link>
          ))}
        </nav>

        {/*
          Two marks, cross-faded. The hero's mark is a white knockout made for
          the dark video and would vanish on the light sections below, so the
          emerald roundel takes over the moment the navbar leaves the dark zone.
          Both are rendered and swapped by opacity rather than conditionally
          mounted, so neither has to load mid-scroll and the change reads as a
          fade instead of a pop.
        */}
        <Link
          href="/"
          aria-label={`${siteMeta.shortName} — home`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="relative block h-10 w-10">
            <BrandMark
              className={cn(
                "absolute inset-0 h-10 w-10 transition-opacity duration-300",
                overDark ? "opacity-0" : "opacity-100",
              )}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/umaid-sadiq-hero-logo.webp"
              alt=""
              width={256}
              height={256}
              decoding="async"
              className={cn(
                "absolute inset-0 h-10 w-10 object-contain transition-opacity duration-300",
                overDark ? "opacity-100" : "opacity-0",
              )}
            />
          </span>
        </Link>
      </div>
    </header>
  );
}
