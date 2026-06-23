import { Button } from "@/components/ui/button";
import { Photo } from "@/components/shared/photo";
import { conversion } from "@/content/site";
import { whatsappLink } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

/** Final branding + CTA section with umaid3 as the closing portrait. */
export function FinalCta() {
  return (
    <section className="bg-canvas">
      <div className="shell shell-wide py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Let&apos;s work together</p>
            </Reveal>
            <Reveal delay={60}>
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

          <Reveal delay={120}>
            <Photo
              src="/images/umaid3"
              alt="Muhammad Umaid Sadiq — let's work together"
              label="umaid3"
              width={1000}
              height={1100}
              className="rounded-lg border border-line"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
