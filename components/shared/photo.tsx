"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EXTS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

function candidates(src: string) {
  if (/\.\w{3,4}$/.test(src)) return [src];
  return EXTS.map((e) => src + e);
}

/**
 * Editorial photo. Defaults to `contain` so the FULL portrait shows (no cropped
 * hair/heads) — on a white canvas the studio backgrounds blend seamlessly, so it
 * reads borderless and premium. Alt is always present (SEO), the aspect ratio is
 * reserved (no CLS), a placeholder covers missing files, and the image reveals
 * with a subtle scale + fade once it loads (reliable, no scroll dependency).
 * Pass `src` without an extension to auto-try .webp → .jpg → .png.
 */
export function Photo({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  priority = false,
  label,
  contain = true,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  label?: string;
  contain?: boolean;
}) {
  const sources = candidates(src);
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setState("ok");
  }, [idx]);

  const handleError = () => {
    if (idx < sources.length - 1) setIdx((i) => i + 1);
    else setState("error");
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        contain ? "bg-canvas" : "bg-fog",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {state !== "ok" && (
        <div className="measure-grid absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {label ?? "Photo"}
          </span>
          <span className="font-display text-sm text-ink/30">{alt}</span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        key={sources[idx]}
        src={sources[idx]}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setState("ok")}
        onError={handleError}
        className={cn(
          "h-full w-full transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          contain ? "object-contain" : "object-cover",
          state === "ok" ? "scale-100 opacity-100" : "scale-[1.05] opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
