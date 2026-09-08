import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { FinalCta } from "@/components/sections/final-cta";
import { Reveal } from "@/components/shared/reveal";
import { profile } from "@/content/profile";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Muhammad Umaid Sadiq is a digital growth partner who builds and grows the entire online presence of ambitious businesses.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title={profile.tagline} />

      {/* Story */}
      <section className="bg-canvas">
        <div className="shell shell-wide grid gap-12 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-28">
          <div className="img-clip rounded-lg">
            <div
              data-anim="img-left"
              className="measure-grid relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-fog"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[6rem] font-semibold leading-none text-ink/10">
                  US
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Reveal>
              <p className="eyebrow">The short version</p>
            </Reveal>
            <Reveal delay={60}>
              <p className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight md:text-3xl">
                {profile.bio}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
                {profile.philosophy}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Process — a real sequence, so numbering is honest here */}
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">How we work</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl">
              A clear path from first call to compounding growth.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {profile.process.map((step) => (
              <Reveal key={step.order} className="bg-mist p-7">
                <span className="font-mono text-sm text-emerald">
                  {String(step.order + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-canvas">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">Capabilities</p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            {profile.expertise.map((skill) => (
              <span
                key={skill}
                className="rounded-sm border border-line px-4 py-2 text-sm text-ink-soft"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
