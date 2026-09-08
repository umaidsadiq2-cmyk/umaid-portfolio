import { z } from "zod";

/**
 * Single source of truth for content + form shapes.
 * Content modules parse against these at load time (fail-fast), and inferred
 * types flow to every consumer. A headless CMS can later produce the same
 * shapes without touching components.
 */

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");

export const imageRefSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const mediaAssetSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  poster: z.string().optional(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
  label: z.string().min(1),
});

export const processStepSchema = z.object({
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1).max(160),
  bio: z.string().min(1),
  philosophy: z.string().min(1),
  expertise: z.array(z.string().min(1)).min(1),
  process: z.array(processStepSchema).min(1),
  avatar: z.object({
    poster: imageRefSchema,
    model: z.string().optional(),
  }),
  socials: z.array(socialLinkSchema),
  location: z.string().min(1),
});

export const capabilitySchema = z.object({
  slug,
  name: z.string().min(1),
  /** Compact label for tight spots (buttons, chips). Falls back to `name`. */
  shortName: z.string().min(1).optional(),
  outcome: z.string().min(1), // business outcome — not a bare label (FR-005)
  description: z.string().min(1),
  /** What the service covers, in the client's words. */
  focus: z.array(z.string().min(1)).default([]),
  /** Named software used to deliver it — concrete proof of craft. */
  tools: z.array(z.string().min(1)).default([]),
  /** Artefacts the client actually receives. */
  deliverables: z.array(z.string().min(1)).default([]),
  order: z.number().int().nonnegative(),
  relatedPortfolio: z.array(slug).default([]),
});

export const portfolioItemSchema = z.object({
  slug,
  title: z.string().min(1),
  category: z.enum(["creative-design", "video-content"]),
  serviceTags: z.array(slug).min(1),
  challenge: z.string().min(1),
  delivered: z.string().min(1),
  result: z.string().optional(),
  media: z.array(mediaAssetSchema).min(1),
  thumbnail: imageRefSchema,
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative(),
  client: z.string().optional(),
});

export const trustSignalSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("logo"),
    order: z.number().int().nonnegative(),
    logo: z.object({
      name: z.string().min(1),
      src: z.string().min(1),
      alt: z.string().min(1),
      url: z.string().url().optional(),
    }),
  }),
  z.object({
    type: z.literal("testimonial"),
    order: z.number().int().nonnegative(),
    testimonial: z.object({
      quote: z.string().min(1),
      author: z.string().min(1),
      role: z.string().optional(),
      company: z.string().optional(),
      avatar: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("result"),
    order: z.number().int().nonnegative(),
    result: z.object({
      metric: z.string().min(1),
      label: z.string().min(1),
      context: z.string().optional(),
    }),
  }),
]);

export const conversionConfigSchema = z.object({
  bookingUrl: z.string().url(),
  whatsapp: z.object({ number: z.string().min(1), prefill: z.string().min(1) }),
  email: z.string().email(),
  primaryCtaLabel: z.string().min(1).default("Book a consultation"),
});

export const navItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

/**
 * A dedicated, long-form SEO landing page for one service — distinct from
 * `capabilitySchema`, which only feeds the compact homepage card and the
 * contact form's service picker. Every string here is real, rendered page
 * copy, so content authors are the ones responsible for keeping it dash-free
 * and free of duplicated phrasing across pages — the schema only enforces shape.
 */
export const servicePageSchema = z.object({
  slug,
  /** Display name, e.g. "Social Media Marketing". */
  name: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  ogTitle: z.string().min(1),
  ogDescription: z.string().min(1),
  eyebrow: z.string().min(1),
  h1: z.string().min(1),
  intro: z.array(z.string().min(1)).min(1),
  heroImage: z.string().min(1),
  heroImageAlt: z.string().min(1),
  overview: z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  offerings: z.object({
    heading: z.string().min(1),
    items: z
      .array(z.object({ title: z.string().min(1), description: z.string().min(1) }))
      .min(1),
  }),
  process: z.object({
    heading: z.string().min(1),
    steps: z
      .array(z.object({ title: z.string().min(1), description: z.string().min(1) }))
      .min(1),
  }),
  benefits: z.object({
    heading: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  }),
  industries: z.object({
    heading: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  }),
  locations: z.object({
    heading: z.string().min(1),
    items: z
      .array(z.object({ region: z.string().min(1), blurb: z.string().min(1) }))
      .min(1),
  }),
  faqs: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .min(1),
  cta: z.object({
    heading: z.string().min(1),
    text: z.string().min(1),
  }),
  /** Slugs of other service pages to link to contextually. */
  relatedSlugs: z.array(slug).default([]),
  order: z.number().int().nonnegative(),
});

export const inquirySchema = z.object({
  name: z.string().min(2, "Tell us your name").max(80),
  email: z.string().email("Enter a valid email"),
  company: z.string().max(120).optional(),
  serviceInterest: z.string().optional(),
  budget: z.enum(["<1k", "1k-5k", "5k-10k", "10k+", "not-sure"]).optional(),
  message: z.string().min(10, "A little more detail helps").max(2000),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to be contacted" }),
  }),
  // Honeypot — must stay empty.
  company_website: z.string().max(0).optional().default(""),
});

export type ImageRef = z.infer<typeof imageRefSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Capability = z.infer<typeof capabilitySchema>;
export type PortfolioItem = z.infer<typeof portfolioItemSchema>;
export type TrustSignal = z.infer<typeof trustSignalSchema>;
export type ConversionConfig = z.infer<typeof conversionConfigSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type Inquiry = z.infer<typeof inquirySchema>;
export type ServicePage = z.infer<typeof servicePageSchema>;
