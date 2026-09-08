import { services } from "@/content/services";
import { conversion } from "@/content/site";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { Ambient } from "@/components/motion/ambient";

/**
 * One labelled group of specifics — focus, tools, or deliverables.
 *
 * Rendered as a definition list rather than prose: these are scannable facts
 * ("Adobe Illustrator", "Business cards"), and a visitor checking whether you
 * do the one thing they need should find it without reading a paragraph.
 * Returns null when empty, so each service shows only the groups it has.
 */
function DetailGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="mt-2.5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full border border-line bg-mist px-3 py-1 text-sm leading-snug text-ink-soft"
          >
            {item}
          </span>
        ))}
      </dd>
    </div>
  );
}

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
    <section id="services" className="relative isolate scroll-mt-24 bg-canvas">
      <Ambient variant="services" />
      <div className="shell shell-wide pt-24 md:pt-32">
        <Reveal>
          <p className="eyebrow">What I do</p>
        </Reveal>
        <Reveal delay={60} rise>
          <h2 className="display-lg mt-6 max-w-4xl">
            Five services. One standard. Built for social-first growth.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Keep scrolling — each service stacks on the last, the way a complete
            social presence is built.
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
            <div className="flex flex-col overflow-hidden rounded-t-[1.8rem] border border-line bg-canvas shadow-[0_-20px_60px_-24px_rgba(11,16,14,0.28)] ring-1 ring-black/[0.02] md:min-h-[78vh]">
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

              {/* Active body — top-aligned so it sits right under the heading
                  strip and never falls below the fold in the stacked state */}
              <div className="grid items-start gap-6 p-5 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:p-12">
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl md:leading-[1.05]">
                    {s.outcome}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft md:mt-6 md:text-base">
                    {s.description}
                  </p>
                  <div className="mt-5 md:mt-8">
                    <Button
                      href={conversion.bookingUrl}
                      size="lg"
                      className="w-full justify-center px-4 text-sm md:w-auto md:px-6 md:text-[0.95rem]"
                    >
                      Start with {s.shortName ?? s.name}
                    </Button>
                  </div>
                </div>

                {/* Specifics, over the editorial giant index. The numeral is
                    purely decorative and sits behind at low opacity, so the
                    card keeps its editorial feel while the column now carries
                    the detail a buyer is actually scanning for. */}
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-8 right-0 hidden select-none font-display text-[12rem] font-semibold leading-none tracking-tighter text-emerald/[0.07] md:block"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dl className="relative space-y-5 md:space-y-6">
                    <DetailGroup label="Focus" items={s.focus} />
                    <DetailGroup label="Tools" items={s.tools} />
                    <DetailGroup label="Deliverables" items={s.deliverables} />
                  </dl>
                </div>
              </div>
            </div>
          </article>
        ))}

        {/* Settle/hold spacer: keeps every card pinned long enough for the full
            stacked state (all headings + active card) to be seen and held. */}
        <div aria-hidden className="h-[32vh] md:h-[45vh]" />
      </div>
    </section>
  );
}
