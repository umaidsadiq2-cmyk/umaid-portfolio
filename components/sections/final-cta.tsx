import { Button } from "@/components/ui/button";
import { Photo } from "@/components/shared/photo";
import { conversion } from "@/content/site";
import { whatsappLink } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";
import { Ambient } from "@/components/motion/ambient";

/** Final branding + CTA section with umaid2 as the closing portrait. */
export function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden bg-canvas">
      <Ambient variant="cta" />
      <div className="shell shell-wide py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Let&apos;s work together</p>
            </Reveal>
            <Reveal delay={60} rise>
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em]">
                Ready to grow your{" "}
                <span className="text-emerald">digital presence?</span>
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
                Book a free consultation and we&apos;ll map the fastest path to
                growth for your business — no pressure, no jargon.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button href={conversion.bookingUrl} size="lg">
                  {conversion.primaryCtaLabel}
                </Button>
                <Button
                  href={whatsappLink(
                    conversion.whatsapp.number,
                    conversion.whatsapp.prefill,
                  )}
                  variant="outline"
                  size="lg"
                >
                  Message on WhatsApp
                </Button>
              </div>
            </Reveal>
          </div>

          <div data-parallax="0.16" className="img-clip">
            <div data-anim="img-right" className="group">
              <Photo
                src="/images/umaid2.webp"
                alt="Muhammad Umaid Sadiq — let's work together"
                label="umaid2"
                width={1000}
                height={1300}
                className="bg-transparent"
                imgClassName="transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
