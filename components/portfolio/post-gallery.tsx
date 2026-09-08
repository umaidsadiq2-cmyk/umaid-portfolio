"use client";

import { useState } from "react";
import { PostViewer } from "./post-viewer";
import type { CreativePost } from "@/lib/cms/types";

/** Instagram's "multiple images" glyph — shown on carousel thumbnails. */
function CarouselIcon() {
  return (
    <span className="pointer-events-none absolute right-2.5 top-2.5 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="8" y="3" width="13" height="13" rx="3" fill="currentColor" opacity="0.55" />
        <rect
          x="3"
          y="8"
          width="13"
          height="13"
          rx="3"
          fill="currentColor"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="0.5"
        />
      </svg>
    </span>
  );
}

/**
 * Instagram-style post grid → fullscreen post viewer. Square thumbnails (the
 * post's first slide), a carousel glyph on multi-slide posts, lazy loading, and
 * a subtle hover lift + zoom. Clicking opens the PostViewer at that post.
 */
export function PostGallery({ posts }: { posts: CreativePost[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {posts.map((post, i) => (
          <li key={post.id} data-anim="card" data-anim-delay={(i % 4) * 60}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={
                post.isCarousel
                  ? `Open carousel — ${post.slides.length} slides`
                  : "Open post"
              }
              className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-line bg-canvas transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-36px_rgba(11,16,14,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover.src}
                alt={post.cover.alt}
                width={post.cover.width}
                height={post.cover.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
              />
              {post.isCarousel && <CarouselIcon />}
            </button>
          </li>
        ))}
      </ul>

      <PostViewer
        post={open === null ? null : (posts[open] ?? null)}
        onClose={() => setOpen(null)}
      />
    </>
  );
}
