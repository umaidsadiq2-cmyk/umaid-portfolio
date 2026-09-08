import {
  conversionConfigSchema,
  navItemSchema,
  type ConversionConfig,
  type NavItem,
} from "@/lib/schemas";
import { z } from "zod";

export const siteMeta = {
  name: "Muhammad Umaid Sadiq",
  shortName: "Umaid Sadiq",
  role: "Digital Marketing Expert",
  description:
    "Muhammad Umaid Sadiq is a social media marketing expert helping businesses across Pakistan, the UAE, UK, Canada, and USA grow with social media marketing and management, content creation, graphic design, video editing, and animation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://umaidsadiq.com",
} as const;

// "Work" and "Services" target the matching sections on the home page; the
// full portfolio still lives at /portfolio, reached from the Selected work
// section's "View all work" link.
export const nav: NavItem[] = z.array(navItemSchema).parse([
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]);

/**
 * The header carries only the on-page section links, so the top of the site
 * stays minimal. About and Contact are still linked from the footer, which
 * renders the full `nav` above — so no page is orphaned.
 *
 * Services leads and Work follows — the reverse of `nav`'s order. On mobile the
 * pair splits either side of the centred logo, so this puts Services on the
 * left and Work on the right; on desktop it reads Services then Work. The
 * footer keeps `nav`'s own order.
 */
export const headerNav: NavItem[] = nav
  .filter((item) => item.href.startsWith("/#"))
  .reverse();

export const conversion: ConversionConfig = conversionConfigSchema.parse({
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://cal.com/umaidsadiq/consultation",
  whatsapp: {
    // Real business number: +92 330 8738597. Kept as the DEFAULT rather than
    // living only in .env.local, so every deploy works without extra config —
    // the env var still overrides it if the number ever changes.
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923308738597",
    prefill:
      process.env.NEXT_PUBLIC_WHATSAPP_PREFILL ??
      "Hi Umaid, I'd like to discuss a project.",
  },
  email: process.env.INQUIRY_TO ?? "hello@umaidsadiq.com",
  primaryCtaLabel: "Book a consultation",
});
