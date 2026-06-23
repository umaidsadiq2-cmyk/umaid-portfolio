import { Button } from "@/components/ui/button";
import { Photo } from "@/components/shared/photo";
import { conversion } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

/**
 * Editorial hero. The H1 is the personal brand. umaid1 is the large primary
 * portrait. Server-rendered text = the LCP; the portrait reserves its space to
 * avoid layout shift.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36">
      <div className="shell shell-wide pb-16 md:pb-24">
        <p className="eyebrow">Digital Marketing Expert</p>

        <div className="mt-8 grid items-end gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
          <div>
            <h1 className="font-display text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.92] tracking-[-0.03em]">
              Muhammad
              <br />
              Umaid <span className="text-emerald">Sadiq</span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
              I help businesses across Pakistan, the UAE, UK, Canada, and the USA
              grow online — from brand and content to web, SEO, and software.
            </p>
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
          </div>

          <Photo
            src="/images/umaid1"
            alt="Muhammad Umaid Sadiq, digital marketing expert"
            label="umaid1"
            width={1000}
            height={1250}
            priority
            className="rounded-lg border border-line"
          />
        </div>
      </div>
    </section>
  );
}
