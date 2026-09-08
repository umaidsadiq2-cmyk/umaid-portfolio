import { Button } from "@/components/ui/button";
import { Photo } from "@/components/shared/photo";
import { VantaFog } from "@/components/motion/vanta-fog";
import { conversion } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

/**
 * Editorial hero with a choreographed intro. After the BrandIntro reveal flies
 * the US mark into the navbar, this sequence is driven by the same GSAP timeline
 * (via the .hero-rise / .hero-fade / .hero-mask hooks): "UMAID SADIQ" rises
 * through a mask, the portrait (umaid1) reveals behind a clip mask, then the
 * eyebrow, subtitle and CTAs settle in.
 *
 * All motion is gated by `html.intro` (JS + motion only). The base markup is
 * fully visible, so reduced-motion and no-JS users get the hero instantly — and
 * the full legal name + role stay in the H1 (visually hidden) and intro copy, so
 * branding and SEO are untouched.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-28 md:pt-36">
      <VantaFog />
      <div className="shell shell-wide pb-16 md:pb-24">
        <p className="eyebrow hero-fade">Digital Marketing Expert</p>

        <div className="mt-8 grid items-center gap-7 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div className="order-2 md:order-1">
            <h1 className="font-display font-semibold uppercase leading-[0.86] tracking-[-0.02em]">
              <span className="sr-only">
                Muhammad Umaid Sadiq — Digital Marketing Expert
              </span>
              <span className="hero-rise block text-[clamp(3.25rem,11vw,9rem)]">
                Umaid
              </span>
              <span className="hero-rise block text-[clamp(3.25rem,11vw,9rem)] text-emerald">
                Sadiq
              </span>
            </h1>

            <p className="hero-fade mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
              I&apos;m Muhammad Umaid Sadiq — a digital marketing expert helping
              businesses across Pakistan, the UAE, UK, Canada, and the USA grow
              online, from brand and content to web, SEO, and software.
            </p>

            <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
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
          </div>

          <div className="hero-mask order-1 md:order-2">
            <div data-parallax="0.14">
              <div data-tilt>
                <div data-anim="float">
                  <Photo
                    src="/images/New1-cut.png"
                    alt="Muhammad Umaid Sadiq, digital marketing expert"
                    label="umaid1"
                    width={1000}
                    height={1300}
                    priority
                    className="bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
