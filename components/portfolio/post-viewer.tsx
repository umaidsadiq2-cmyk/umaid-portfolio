"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CreativePost } from "@/lib/cms/types";

/**
 * Instagram-style post viewer. A single image just shows; a carousel can be
 * walked with swipe (touch), mouse drag, ‹/› buttons, and ←/→ keys, with a
 * horizontal sliding track, slide indicators, and adjacent-slide preloading.
 *
 * Enter: fade + scale-up over a blurred backdrop. Exit: fade-out. Always mounted
 * by the parent (`post` is null when closed) so it can animate its own exit and
 * the grid behind keeps its exact scroll position. Body scroll locks while open.
 */
export function PostViewer({
  post,
  onClose,
  startIndex = 0,
}: {
  post: CreativePost | null;
  onClose: () => void;
  /** Slide to open on — lets a gallery open its whole set at the clicked image. */
  startIndex?: number;
}) {
  const [current, setCurrent] = useState<CreativePost | null>(post);
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dx, setDx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const count = current?.slides.length ?? 0;
  const isCarousel = count > 1;

  const nav = useCallback(
    (d: number) => setSlide((s) => Math.max(0, Math.min(count - 1, s + d))),
    [count],
  );

  // Enter / exit lifecycle driven by the `post` prop.
  useEffect(() => {
    if (post) {
      setCurrent(post);
      setSlide(Math.max(0, Math.min(post.slides.length - 1, startIndex)));
      setDx(0);
      const r = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(r);
    }
    setOpen(false);
    const t = setTimeout(() => setCurrent(null), 260);
    return () => clearTimeout(t);
  }, [post, startIndex]);

  // Body scroll lock (preserves the grid's scroll position) + keyboard nav.
  useEffect(() => {
    if (!current) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") nav(1);
      else if (e.key === "ArrowLeft") nav(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [current, nav, onClose]);

  if (!current) return null;

  const width = viewportRef.current?.offsetWidth ?? 1;
  const pct = -slide * 100 + (dx / width) * 100;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isCarousel) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    let delta = e.clientX - startX.current;
    // resistance at the ends
    if ((slide === 0 && delta > 0) || (slide === count - 1 && delta < 0)) {
      delta *= 0.35;
    }
    setDx(delta);
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const threshold = width * 0.16;
    if (dx <= -threshold) nav(1);
    else if (dx >= threshold) nav(-1);
    setDx(0);
  };

  const btn =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-2xl text-white backdrop-blur-md transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.isCarousel ? "Carousel post viewer" : "Post viewer"}
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-ink/75 p-4 backdrop-blur-xl transition-opacity duration-300 ease-out motion-reduce:transition-none",
        open ? "opacity-100" : "opacity-0",
      )}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close viewer"
        className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-2xl text-white backdrop-blur-md transition hover:bg-white/25"
      >
        ✕
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative aspect-[4/5] w-[min(94vw,calc(82vh*0.8))] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open ? "scale-100" : "scale-95",
        )}
      >
        <div
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "h-full w-full overflow-hidden rounded-xl bg-ink/40 shadow-2xl",
            isCarousel && (dragging ? "cursor-grabbing" : "cursor-grab"),
          )}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(${pct}%)`,
              transition: dragging
                ? "none"
                : "transform 360ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {current.slides.map((s, i) => (
              <div key={s.src} className="h-full min-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  draggable={false}
                  loading={Math.abs(i - slide) <= 1 ? "eager" : "lazy"}
                  decoding="async"
                  className="pointer-events-none h-full w-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {isCarousel && slide > 0 && (
          <button
            type="button"
            onClick={() => nav(-1)}
            aria-label="Previous slide"
            className={cn(btn, "left-3")}
          >
            ‹
          </button>
        )}
        {isCarousel && slide < count - 1 && (
          <button
            type="button"
            onClick={() => nav(1)}
            aria-label="Next slide"
            className={cn(btn, "right-3")}
          >
            ›
          </button>
        )}
      </div>

      {isCarousel && (
        <div onClick={(e) => e.stopPropagation()}>
          {count <= 8 ? (
            <div className="flex items-center gap-2">
              {current.slides.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === slide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-full bg-white/12 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
              {slide + 1} / {count}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
