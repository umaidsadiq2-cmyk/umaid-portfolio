import { services } from "@/content/services";
import { conversion } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";

/**
 * Signature section — sticky stacking cards. Each service is pinned at an
 * increasing top offset, so the next card slides over the previous one, leaving
 * its heading strip stacked above the active card. Pure CSS sticky: smooth,
 * performant, SEO-friendly (all content server-rendered). Light editorial style.
 */
export function ServicesStack() {
  const ordered = [...services].sort((a, b) => a.order - b.order);
  const total = ordered.length;

  return (
    <section id="services" className="scroll-mt-24 bg-canvas">
      <div className="shell shell-wide pt-24 md:pt-32">
        <Reveal>
          <p className="eyebrow">What I do</p>
        </Reveal>
        <Reveal delay={60}>
          <h2 className="display-lg mt-6 max-w-4xl">
            Seven services. One standard. Built to compound.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Keep scrolling — each service stacks on the last, the way a complete
            digital presence is built.
          </p>
        </Reveal>
      </div>

      <div className="stack shell shell-wide pb-24 pt-10 md:pb-32">
        {ordered.map((s, i) => (
          <article
            key={s.slug}
            className="stack-card"
            style={{ top: `calc(var(--nav-h) + ${i} * var(--strip-h))` }}
          >
            <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-t-[1.6rem] border border-line bg-canvas shadow-[0_-12px_48px_-20px_rgba(11,16,14,0.18)] md:min-h-[78vh]">
              {/* Heading strip — stays visible when covered */}
              <div
                className="flex items-center justify-between gap-4 border-b border-line bg-mist px-6 md:px-12"
                style={{ height: "var(--strip-h)" }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-emerald">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-semibold tracking-tight text-ink md:text-2xl">
                    {s.name}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted">
                  {i + 1}/{total}
                </span>
              </div>

              {/* Active body */}
              <div className="grid flex-1 content-center items-center gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:p-14">
                <div>
                  <h3 className="font-display text-3xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl">
                    {s.outcome}
                  </h3>
                  <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
                    {s.description}
                  </p>
                  <div className="mt-8">
                    <Button href={conversion.bookingUrl} size="lg">
                      Start with {s.name}
                    </Button>
                  </div>
                </div>

                {/* Editorial giant index */}
                <div className="hidden items-center justify-end md:flex">
                  <span className="font-display text-[12rem] font-semibold leading-none tracking-tighter text-emerald/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
