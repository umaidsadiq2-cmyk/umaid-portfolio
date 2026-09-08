import Link from "next/link";
import { PageHeader } from "@/components/sections/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { conversion } from "@/content/site";
import { getServicePage, servicePages } from "@/content/service-pages";
import { whatsappLink } from "@/lib/utils";
import type { ServicePage } from "@/lib/schemas";

/**
 * Shared structure for every dedicated service landing page. The SECTIONS are
 * common across all six pages (that consistency is what makes the site feel
 * like one system), but every heading, paragraph, and list item comes from
 * `content/service-pages.ts` — nothing here is templated text.
 */
export function ServicePageTemplate({ page }: { page: ServicePage }) {
  const related = page.relatedSlugs
    .map((slug) => getServicePage(slug))
    .filter((p): p is ServicePage => Boolean(p));

  return (
    <>
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.h1}
        intro={page.intro[0]}
        breadcrumb={
          <Breadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "Services", href: "/#services" },
              { name: page.name },
            ]}
          />
        }
      />

      {/* Overview — hero image paired with the business case for the service. */}
      <section className="bg-canvas">
        <div className="shell shell-wide grid gap-12 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-28">
          <div className="img-clip rounded-lg">
            <div
              data-anim="img-left"
              className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.heroImage}
                alt={page.heroImageAlt}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            {page.intro[1] && (
              <Reveal>
                <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
                  {page.intro[1]}
                </p>
              </Reveal>
            )}
            <Reveal delay={60} rise>
              <h2 className="display-lg mt-8 max-w-2xl !text-[clamp(1.75rem,3.5vw,2.75rem)]">
                {page.overview.heading}
              </h2>
            </Reveal>
            <div className="mt-6 space-y-4">
              {page.overview.paragraphs.map((p, i) => (
                <Reveal key={i} delay={100 + i * 40}>
                  <p className="max-w-2xl leading-relaxed text-ink-soft">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What I offer */}
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">What I offer</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(1.9rem,4vw,3.25rem)]">
              {page.offerings.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {page.offerings.items.map((item) => (
              <Reveal key={item.title} className="bg-mist p-7">
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How I work */}
      <section className="bg-canvas">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">My process</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(1.9rem,4vw,3.25rem)]">
              {page.process.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {page.process.steps.map((step, i) => (
              <Reveal key={step.title} className="bg-canvas p-7">
                <span className="font-mono text-sm text-emerald">
                  {String(i + 1).padStart(2, "0")}
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

      {/* Benefits + industries */}
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">Why it works</p>
          </Reveal>
          <div className="mt-8 grid gap-12 md:grid-cols-2">
            <div>
              <Reveal rise>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {page.benefits.heading}
                </h2>
              </Reveal>
              <ul className="mt-6 space-y-3">
                {page.benefits.items.map((b) => (
                  <Reveal key={b} as="li" className="flex gap-3 text-ink-soft">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                    <span className="leading-relaxed">{b}</span>
                  </Reveal>
                ))}
              </ul>
            </div>
            <div>
              <Reveal rise>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                  {page.industries.heading}
                </h2>
              </Reveal>
              <div className="mt-6 flex flex-wrap gap-3">
                {page.industries.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-sm border border-line bg-canvas px-4 py-2 text-sm text-ink-soft"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-canvas">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">Where I work</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(1.9rem,4vw,3.25rem)]">
              {page.locations.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {page.locations.items.map((loc) => (
              <Reveal key={loc.region}>
                <h3 className="font-display text-lg font-semibold tracking-tight text-emerald">
                  {loc.region}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{loc.blurb}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">Common questions</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(1.9rem,4vw,3.25rem)]">
              Frequently asked questions about {page.name}
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {page.faqs.map((faq) => (
              <Reveal key={faq.question} className="py-6">
                <h3 className="font-display text-base font-semibold tracking-tight md:text-lg">
                  {faq.question}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
                  {faq.answer}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative isolate overflow-hidden bg-canvas">
        <div className="shell shell-wide py-20 md:py-28">
          <Reveal>
            <p className="eyebrow">Get started</p>
          </Reveal>
          <Reveal delay={60} rise>
            <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(2rem,4.5vw,3.75rem)]">
              {page.cta.heading}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {page.cta.text}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href={conversion.bookingUrl} size="lg">
                {conversion.primaryCtaLabel}
              </Button>
              <Button
                href={whatsappLink(conversion.whatsapp.number, conversion.whatsapp.prefill)}
                variant="outline"
                size="lg"
              >
                Message on WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related services — internal linking across the six pages. */}
      {related.length > 0 && (
        <section className="bg-mist">
          <div className="shell shell-wide py-20 md:py-28">
            <Reveal>
              <p className="eyebrow">Related services</p>
            </Reveal>
            <Reveal delay={60} rise>
              <h2 className="display-lg mt-6 max-w-3xl !text-[clamp(1.75rem,3.5vw,2.75rem)]">
                Other ways I can help your business grow
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group bg-mist p-7 transition-colors hover:bg-canvas"
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight text-ink transition-colors group-hover:text-emerald">
                    {r.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.intro[0]}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/** All six slugs, for `generateStaticParams`. */
export const servicePageSlugs = servicePages.map((p) => p.slug);
