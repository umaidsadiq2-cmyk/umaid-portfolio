"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { VideoItem } from "@/lib/cms/types";

/**
 * Video grid → fullscreen player, mirroring PostGallery/PostViewer so the two
 * portfolio sections feel like one site.
 *
 * The grid renders a FAÇADE: a thumbnail and a play button, never an iframe.
 * Ten YouTube embeds would pull well over a megabyte of third-party JS and
 * wreck the Lighthouse budget; the real iframe is created only when a video is
 * opened, and destroyed on close so playback actually stops.
 */
export function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const current = openIndex === null ? null : (videos[openIndex] ?? null);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video, i) => (
          <li key={video.id} data-anim="card" data-anim-delay={(i % 3) * 80}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Play ${video.title}`}
              className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-line bg-ink transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-36px_rgba(11,16,14,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald"
            >
              {video.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-90 transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-ink-soft to-ink"
                />
              )}

              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
              />

              {/* Play affordance */}
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 ease-out group-hover:scale-110"
              >
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                  <path d="M17 10 0 20V0l17 10Z" fill="#0b100e" />
                </svg>
              </span>

              {video.pinned && (
                <span className="absolute left-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  Featured
                </span>
              )}

              <span className="absolute inset-x-0 bottom-0 p-4 text-left">
                <span className="line-clamp-2 text-sm font-medium text-white">
                  {video.title}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <VideoPlayer video={current} onClose={() => setOpenIndex(null)} />
    </>
  );
}

/**
 * Fullscreen player. Always mounted by the parent (`video` is null when closed)
 * so it can animate its own exit while the grid keeps its scroll position —
 * same contract as PostViewer.
 */
function VideoPlayer({
  video,
  onClose,
}: {
  video: VideoItem | null;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState<VideoItem | null>(video);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (video) {
      setCurrent(video);
      // Next frame, so the enter transition has a "from" state to animate out of.
      const id = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(id);
    }
    setOpen(false);
    // Keep the old video mounted through the exit transition, then drop it —
    // unmounting the iframe is what actually stops audio.
    const id = setTimeout(() => setCurrent(null), 300);
    return () => clearTimeout(id);
  }, [video]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!video) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);

    // Lock body scroll without the layout shifting as the scrollbar disappears.
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [video, handleClose]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onClick={handleClose}
      className={cn(
        "fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4 backdrop-blur-sm transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={handleClose}
        aria-label="Close video"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        ✕
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-5xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "scale-100" : "scale-95",
        )}
      >
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
          {current.embedUrl ? (
            <iframe
              src={`${current.embedUrl}${current.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          ) : (
            // Direct upload — no third party involved.
            <video
              src={current.url}
              poster={current.thumbUrl ?? undefined}
              controls
              autoPlay
              playsInline
              className="h-full w-full"
            />
          )}
        </div>
        <p className="mt-3 text-center text-sm text-white/80">{current.title}</p>
      </div>
    </div>
  );
}
