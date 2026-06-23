import { Photo } from "@/components/shared/photo";
import { Reveal } from "@/components/shared/reveal";

/** Editorial personal statement with umaid2 as a large portrait. */
export function PersonalStatement() {
  return (
    <section className="bg-mist">
      <div className="shell shell-wide grid items-center gap-12 py-24 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:py-32">
        <Reveal>
          <Photo
            src="/images/umaid2"
            alt="Muhammad Umaid Sadiq, digital marketing expert portrait"
            label="umaid2"
            width={900}
            height={1100}
            className="rounded-lg border border-line"
          />
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">Why work with me</p>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-6 font-display text-[clamp(1.75rem,3.4vw,3rem)] font-semibold leading-[1.08] tracking-tight">
              I build digital presence that earns{" "}
              <span className="text-emerald">trust</span> — and turns attention
              into business.
            </p>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              For over five years I&apos;ve helped founders, clinics, agencies, and
              service businesses look credible and grow online. Not a pile of
              disconnected services — one standard applied across brand, content,
              web, and SEO.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
