import Link from "next/link";
import { Photo } from "@/components/shared/photo";
import { Reveal } from "@/components/shared/reveal";

const CATEGORIES = [
  {
    title: "Social Media Creatives",
    blurb: "Brand-led posts, carousels, and campaigns that grow engaged audiences.",
    href: "/portfolio/creative-designs",
    img: "/images/portfolio-creative",
    label: "Creative",
  },
  {
    title: "Video Content",
    blurb: "Short-form and brand films cut for retention, shares, and action.",
    href: "/portfolio/video-content",
    img: "/images/portfolio-video",
    label: "Video",
  },
];

export function PortfolioPreview() {
  return (
    <section className="bg-mist">
      <div className="shell shell-wide py-24 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">Selected work</p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="display-lg mt-6">A look at the work.</h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 text-sm font-medium text-emerald"
            >
              View all work
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.href} delay={i * 80}>
              <Link
                href={c.href}
                className="group block overflow-hidden rounded-lg border border-line bg-canvas"
              >
                <div className="overflow-hidden">
                  <Photo
                    src={c.img}
                    alt={`${c.title} — portfolio by Muhammad Umaid Sadiq`}
                    label={c.label}
                    width={1200}
                    height={800}
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-7">
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">
                      {c.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                      {c.blurb}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="text-emerald transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
