import type { ElementType, ReactNode } from "react";

/**
 * Scroll-reveal primitive. Emits `data-anim` hooks that the MotionProvider picks
 * up and drives with GSAP + ScrollTrigger:
 * - default: a soft rise + fade
 * - `rise`: a masked clip reveal where the heading rises from behind a line
 * `delay` (ms) staggers grouped reveals. The markup is fully visible without JS
 * or under reduced motion (the hidden state is gated in globals.css), so content
 * and SEO are never blocked on animation.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  rise = false,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  rise?: boolean;
}) {
  return (
    <Tag
      className={className}
      data-anim={rise ? "split" : "reveal"}
      data-anim-delay={delay || undefined}
    >
      {children}
    </Tag>
  );
}
