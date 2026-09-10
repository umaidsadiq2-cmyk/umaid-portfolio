"use client";

import { useEffect, useRef, useState } from "react";
import { VideoGallery } from "./video-gallery";
import { cn } from "@/lib/utils";
import type { VideoCategory } from "@/content/work";

/**
 * All video work on one page, grouped by category — the same layout and
 * interaction as IndustryShowcase on the Social Media Creatives page.
 *
 * Categories render in order, each with a sticky text column beside its
 * videos, so scrolling past one category flows straight into the next. The
 * buttons above jump to a category and highlight whichever one is on screen;
 * each block's id (#ai-video-ads…) deep-links. The video tiles and player are
 * the existing VideoGallery, unchanged.
 */
export function VideoCategoryShowcase({ categories }: { categories: VideoCategory[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const blocks = useRef<Map<string, HTMLElement>>(new Map());

  // Highlight the category whose block is crossing the upper part of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    blocks.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  // Honour a deep link (#logo-animations) on first load.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const el = blocks.current.get(hash);
    if (el) {
      setActive(hash);
      el.scrollIntoView();
    }
  }, []);

  const select = (slug: string) => {
    setActive(slug);
    window.history.replaceState(null, "", `#${slug}`);
    blocks.current.get(slug)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (categories.length === 0) return null;

  return (
    <>
      <div
        aria-label="Video categories"
        className="-mx-[var(--gutter)] flex gap-2.5 overflow-x-auto px-[var(--gutter)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => {
          const selected = category.slug === active;
          return (
            <button
              key={category.slug}
              type="button"
              aria-current={selected ? "true" : undefined}
              onClick={() => select(category.slug)}
              className={cn(
                "shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald",
                selected
                  ? "border-emerald bg-emerald text-white shadow-[0_10px_24px_-14px_rgba(21,128,61,0.8)]"
                  : "border-line bg-canvas text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {categories.map((category, idx) => (
        <section
          key={category.slug}
          id={category.slug}
          ref={(el) => {
            if (el) blocks.current.set(category.slug, el);
            else blocks.current.delete(category.slug);
          }}
          aria-labelledby={`${category.slug}-title`}
          className={cn(
            "grid scroll-mt-28 gap-10 lg:grid-cols-12 lg:gap-12",
            idx === 0 ? "mt-10" : "mt-20 md:mt-28",
          )}
        >
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Category</p>
              <h2
                id={`${category.slug}-title`}
                className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl"
              >
                {category.label}
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
                {category.description}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <VideoGallery videos={category.videos} />
          </div>
        </section>
      ))}
    </>
  );
}
