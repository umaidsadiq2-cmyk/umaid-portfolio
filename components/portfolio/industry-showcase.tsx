"use client";

import { useEffect, useState } from "react";
import { PostViewer } from "./post-viewer";
import { cn } from "@/lib/utils";
import type { CreativePost, Poster } from "@/lib/cms/types";
import type { Industry } from "@/content/work";

/**
 * All social media creatives on one page, filtered by industry.
 *
 * A row of industry buttons sits above the grid; choosing one swaps in that
 * industry's posters and a short note on the work done for it. The choice is
 * mirrored to the URL hash (#automotive, #perfume…) so a specific industry can
 * be linked to directly, without separate pages.
 *
 * Posters keep their natural aspect ratio rather than a square crop — many are
 * full 3×3 feed grids that would lose most of their content if cropped.
 */
export function IndustryShowcase({ industries }: { industries: Industry[] }) {
  const [active, setActive] = useState(industries[0]?.slug ?? "");
  const [open, setOpen] = useState<Poster | null>(null);

  // Honour a deep link (#snacks) on first load.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (industries.some((i) => i.slug === hash)) setActive(hash);
  }, [industries]);

  const select = (slug: string) => {
    setActive(slug);
    window.history.replaceState(null, "", `#${slug}`);
  };

  const current = industries.find((i) => i.slug === active) ?? industries[0];
  if (!current) return null;

  const viewerPost: CreativePost | null = open
    ? { id: open.src, slides: [open], cover: open, isCarousel: false, pinned: false }
    : null;

  return (
    <>
      <div
        role="tablist"
        aria-label="Industries"
        className="-mx-[var(--gutter)] flex gap-2.5 overflow-x-auto px-[var(--gutter)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {industries.map((industry) => {
          const selected = industry.slug === current.slug;
          return (
            <button
              key={industry.slug}
              type="button"
              role="tab"
              id={`tab-${industry.slug}`}
              aria-selected={selected}
              aria-controls="industry-panel"
              onClick={() => select(industry.slug)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald",
                selected
                  ? "border-emerald bg-emerald text-white shadow-[0_10px_24px_-14px_rgba(21,128,61,0.8)]"
                  : "border-line bg-canvas text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {industry.label}
            </button>
          );
        })}
      </div>

      <div
        id="industry-panel"
        role="tabpanel"
        aria-labelledby={`tab-${current.slug}`}
        className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12"
      >
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Industry</p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {current.label}
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
              {current.description}
            </p>
            <p className="mt-6 text-sm font-medium text-muted">
              {current.posters.length}{" "}
              {current.posters.length === 1 ? "creative" : "creatives"}
            </p>
          </div>
        </div>

        <ul
          key={current.slug}
          className={cn(
            "grid gap-4 sm:gap-5 lg:col-span-8",
            current.posters.length > 1 && "sm:grid-cols-2",
          )}
        >
          {current.posters.map((poster) => (
            <li key={poster.src}>
              <button
                type="button"
                onClick={() => setOpen(poster)}
                aria-label={`Open ${poster.alt}`}
                className="group block w-full overflow-hidden rounded-lg border border-line bg-canvas transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-36px_rgba(11,16,14,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster.src}
                  alt={poster.alt}
                  width={poster.width}
                  height={poster.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <PostViewer post={viewerPost} onClose={() => setOpen(null)} />
    </>
  );
}
