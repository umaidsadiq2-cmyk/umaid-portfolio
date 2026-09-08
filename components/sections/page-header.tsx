import type { ReactNode } from "react";
import { Reveal } from "@/components/shared/reveal";
import { Ambient } from "@/components/motion/ambient";

/** Consistent page intro used across inner routes. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  breadcrumb?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate border-b border-line bg-canvas pt-32 md:pt-40">
      <Ambient variant="header" />
      <div className="shell shell-wide pb-16 md:pb-20">
        {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={60} rise>
          <h1 className="display-lg mt-6 max-w-4xl">{title}</h1>
        </Reveal>
        {intro && (
          <Reveal delay={120}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {intro}
            </p>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
