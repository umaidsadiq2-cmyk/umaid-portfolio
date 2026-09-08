import { cn } from "@/lib/utils";

type Variant =
  | "hero"
  | "about"
  | "services"
  | "portfolio"
  | "cta"
  | "header";

/**
 * Ambient background — a living atmosphere rebuilt in code (NOT an image) to
 * match the design reference: a soft white field with flowing, desaturated
 * sage-green clouds, bright cream light blooms, and faint curved hairlines.
 *
 * Pure-CSS markup (zero JS): several heavily-blurred radial-gradient layers + an
 * inline SVG of hairlines. Each layer floats, drifts, breathes and rotates on
 * its own cycle (globals.css), and follows the pointer with eased multi-depth
 * parallax — the offsets come from AmbientPointer via `--mx`/`--my` and are
 * applied through the independent `translate` property, so the mouse parallax
 * COMPOSES with the breathing loop instead of replacing it.
 *
 * Only transform/opacity/translate animate → GPU-composited, no layout, no CLS.
 * It's `aria-hidden`, out of flow, and sits behind content via a negative
 * z-index scoped by the section's `isolate`. All motion is gated to
 * `prefers-reduced-motion: no-preference`. Per-section intensity is `variant`.
 *
 * Place as the FIRST child of a section that has `relative isolate`.
 */
export function Ambient({
  variant = "hero",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("ambient", `ambient-${variant}`, className)}>
      <span className="ambient-bloom" />
      <span className="ambient-cloud ambient-cloud-1" />
      <span className="ambient-cloud ambient-cloud-2" />
      <span className="ambient-cloud ambient-cloud-3" />
      <span className="ambient-cloud ambient-cloud-4" />
      <span className="ambient-cloud ambient-cloud-5" />
      <svg
        className="ambient-lines"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          className="ambient-line ambient-line-1"
          d="M-40 640 C 340 540 600 720 900 620 S 1480 560 1660 660"
        />
        <path
          className="ambient-line ambient-line-2"
          d="M-40 720 C 360 660 680 820 1020 700 S 1500 660 1660 740"
        />
        <path
          className="ambient-line ambient-line-3"
          d="M-40 560 C 300 500 560 600 880 540 S 1460 520 1660 580"
        />
      </svg>
    </div>
  );
}
