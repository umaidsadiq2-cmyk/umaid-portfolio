import { conversion } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

/**
 * Floating WhatsApp button — fixed bottom-right on every public page.
 *
 * A plain server-rendered anchor: no state, no effects, no client bundle. It is
 * the cheapest possible thing that can sit on every page without touching the
 * performance budget, and it still works with JavaScript disabled.
 *
 * Layering: z-30 is deliberate. It must float above page content but BELOW the
 * mobile menu and navbar (z-40), the brand intro (z-80), and the lightboxes
 * (z-90 / z-200) — otherwise a green circle would hover over every fullscreen
 * overlay on the site.
 */
export function WhatsAppFloat() {
  const href = whatsappLink(conversion.whatsapp.number, conversion.whatsapp.prefill);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Umaid on WhatsApp"
      data-magnetic
      className="group fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_10px_30px_-8px_rgba(11,16,14,0.45)] ring-1 ring-black/10 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-10px_rgba(11,16,14,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald motion-reduce:transition-none md:bottom-7 md:right-7"
      style={{
        // Clears the iOS home-indicator strip so the button never sits under it.
        marginBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Official WhatsApp glyph, inlined — no network request, no third-party
          script, and it scales crisply at any DPI. */}
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        className="text-white"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>

      {/* Desktop-only label that slides out on hover. Hidden from assistive tech
          because the anchor already carries an accessible name. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-sm bg-ink px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none md:block"
      >
        Message on WhatsApp
      </span>
    </a>
  );
}
