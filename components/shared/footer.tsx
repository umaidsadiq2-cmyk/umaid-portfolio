import Link from "next/link";
import { nav, conversion, siteMeta } from "@/content/site";
import { profile } from "@/content/profile";
import { whatsappLink } from "@/lib/utils";

export function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-line bg-mist">
      <div className="shell shell-wide py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight">
              {siteMeta.shortName}
              <span className="text-emerald">.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {profile.tagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-underline text-sm text-ink-soft transition-colors hover:text-emerald"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Get in touch</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={conversion.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm text-ink-soft transition-colors hover:text-emerald"
                >
                  Book a consultation
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(
                    conversion.whatsapp.number,
                    conversion.whatsapp.prefill,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-sm text-ink-soft transition-colors hover:text-emerald"
                >
                  Message on WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${conversion.email}`}
                  className="link-underline text-sm text-ink-soft transition-colors hover:text-emerald"
                >
                  {conversion.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {year} {siteMeta.name}. All rights reserved.
          </p>
          <p className="font-mono">{profile.location}</p>
        </div>
      </div>
    </footer>
  );
}
