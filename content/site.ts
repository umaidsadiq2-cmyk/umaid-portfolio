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
    "Muhammad Umaid Sadiq is a digital marketing expert helping businesses across Pakistan, the UAE, UK, Canada, and USA grow with social media marketing, content creation, graphic design, video editing, website development, SEO, and software solutions.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://umaidsadiq.com",
} as const;

export const nav: NavItem[] = z.array(navItemSchema).parse([
  { label: "Work", href: "/portfolio" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
]);

export const conversion: ConversionConfig = conversionConfigSchema.parse({
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://cal.com/umaidsadiq/consultation",
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "920000000000",
    prefill:
      process.env.NEXT_PUBLIC_WHATSAPP_PREFILL ??
      "Hi Umaid, I'd like to discuss a project.",
  },
  email: process.env.INQUIRY_TO ?? "hello@umaidsadiq.com",
  primaryCtaLabel: "Book a consultation",
});
