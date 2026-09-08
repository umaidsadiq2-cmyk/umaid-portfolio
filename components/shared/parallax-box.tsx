"use client";

import type { ReactNode } from "react";
import { useParallax } from "@/hooks/use-parallax";

/** Wraps content with a subtle scroll parallax (transform-only). */
export function ParallaxBox({
  children,
  factor = 0.06,
  className,
}: {
  children: ReactNode;
  factor?: number;
  className?: string;
}) {
  const ref = useParallax<HTMLDivElement>(factor);
  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
