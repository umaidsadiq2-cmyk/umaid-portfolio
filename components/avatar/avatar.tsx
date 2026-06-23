"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const REAL_AVATAR = "/avatar/avatar.png";
const FALLBACK = "/avatar/avatar-fallback.svg";

/**
 * The brand character. Recurs throughout the journey as a guide.
 *
 * Renders the crafted SVG placeholder first (always clean — no broken icon),
 * then upgrades to the real avatar at /avatar/avatar.png the moment that file
 * exists. To use the real character: save your avatar image (transparent or
 * black background works best on the dark stages) to public/avatar/avatar.png.
 */
export function Avatar({
  className,
  priority = false,
  float = false,
}: {
  className?: string;
  priority?: boolean;
  float?: boolean;
}) {
  const [src, setSrc] = useState(FALLBACK);

  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setSrc(REAL_AVATAR);
    probe.src = REAL_AVATAR;
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Muhammad Umaid Sadiq — avatar"
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn(
        "select-none object-contain",
        float && "avatar-float motion-reduce:animate-none",
        className,
      )}
    />
  );
}
