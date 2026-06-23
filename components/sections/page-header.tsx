import type { ReactNode } from "react";
import { Reveal } from "@/components/shared/reveal";

/** Consistent page intro used across inner routes. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-canvas pt-32 md:pt-40">
      <div className="shell shell-wide pb-16 md:pb-20">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={60}>
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
