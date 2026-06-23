import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/sections/contact-form";
import { conversion } from "@/content/site";
import { profile } from "@/content/profile";
import { whatsappLink } from "@/lib/utils";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Book a consultation with Muhammad Umaid Sadiq, or send a message. Working with businesses across Pakistan, USA, UK, Canada & UAE.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Let's talk"
        title="Tell me what you want to grow."
        intro="Book a free consultation or send a message. I reply within one business day."
      />

      <section className="bg-mist">
        <div className="shell shell-wide grid gap-12 py-20 md:grid-cols-[1fr_0.8fr] md:py-28">
          <div className="rounded-lg border border-line bg-canvas p-7 md:p-9">
            <ContactForm />
          </div>

          <aside className="space-y-8">
            <div>
              <p className="eyebrow mb-3">Fastest path</p>
              <a
                href={conversion.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl font-semibold tracking-tight text-emerald hover:text-emerald-deep"
              >
                Book a consultation →
              </a>
              <p className="mt-2 text-sm text-ink-soft">
                A focused 30-minute call to map your fastest path to growth.
              </p>
            </div>

            <div>
              <p className="eyebrow mb-3">Prefer to message</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={whatsappLink(
                      conversion.whatsapp.number,
                      conversion.whatsapp.prefill,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-soft hover:text-emerald"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${conversion.email}`}
                    className="text-ink-soft hover:text-emerald"
                  >
                    {conversion.email}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-3">Based</p>
              <p className="text-sm text-ink-soft">{profile.location}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
