"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EXTS = [".webp", ".jpg", ".jpeg", ".png", ".avif"];

function candidates(src: string) {
  // If a concrete extension is given, use it as-is; otherwise try common ones.
  if (/\.\w{3,4}$/.test(src)) return [src];
  return EXTS.map((e) => src + e);
}

/**
 * Editorial photo with a graceful placeholder. The <img> alt is always present
 * (crawlable for SEO), the container reserves the aspect ratio (no CLS), and a
 * tasteful placeholder shows until a real file loads — so missing assets never
 * render a broken icon. Pass `src` WITHOUT an extension (e.g. "/images/umaid1")
 * and it will try .webp → .jpg → .png automatically.
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
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  label?: string;
}) {
  const sources = candidates(src);
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image already finished loading before hydration, onLoad won't fire —
  // detect that here so the photo isn't stuck invisible.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setState("ok");
  }, [idx]);

  const handleError = () => {
    if (idx < sources.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setState("error");
    }
  };

  return (
    <div
      className={cn("relative overflow-hidden bg-fog", className)}
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
          "h-full w-full object-cover transition-opacity duration-700 ease-out",
          state === "ok" ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
