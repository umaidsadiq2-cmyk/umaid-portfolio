import { Photo } from "@/components/shared/photo";
import { Reveal } from "@/components/shared/reveal";
import { Ambient } from "@/components/motion/ambient";

/** Editorial personal statement with umaid3 as a large portrait. */
export function PersonalStatement() {
  return (
    <section className="relative isolate bg-mist">
      <Ambient variant="about" />
      <div className="shell shell-wide grid items-center gap-7 py-20 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:py-32">
        <div data-parallax="0.16" className="img-clip">
          <div data-anim="img-left" className="group">
            <Photo
              src="/images/New2-cut.png"
              alt="Muhammad Umaid Sadiq, digital marketing expert portrait"
              label="umaid3"
              width={1000}
              height={1300}
              className="bg-transparent"
              imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            />
          </div>
        </div>

        <div>
          <Reveal>
            <p className="eyebrow">Why work with me</p>
          </Reveal>
          <Reveal delay={80} rise>
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
