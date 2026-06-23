import { capabilitySchema, type Capability } from "@/lib/schemas";
import { z } from "zod";

/**
 * The seven offerings, presented as ONE integrated growth system.
 * Each is framed by the business OUTCOME it produces, never a bare label.
 */
export const services: Capability[] = z.array(capabilitySchema).parse([
  {
    slug: "social-media-marketing",
    name: "Social Media Marketing",
    outcome: "Turn followers into a pipeline of paying customers.",
    description:
      "Strategy, calendars, and campaigns that grow the right audience and move them toward a sale — not vanity metrics.",
    order: 0,
    relatedPortfolio: [],
  },
  {
    slug: "content-creation",
    name: "Content Creation",
    outcome: "Show up everywhere your buyers already pay attention.",
    description:
      "On-brand posts, carousels, and copy produced at the cadence platforms reward, so your presence compounds week over week.",
    order: 1,
    relatedPortfolio: [],
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    outcome: "Look like the most trusted name in your category.",
    description:
      "Identity, brand systems, and visuals with the polish that makes a business feel established before the first call.",
    order: 2,
    relatedPortfolio: [],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    outcome: "Stop the scroll and hold attention to the last frame.",
    description:
      "Short-form and brand films cut for retention — pacing, captions, and motion that earn watch-time and shares.",
    order: 3,
    relatedPortfolio: [],
  },
  {
    slug: "web-development",
    name: "Website Development",
    outcome: "A site that loads instantly and turns visitors into leads.",
    description:
      "Fast, accessible, conversion-focused websites engineered to the same standard as the one you're reading.",
    order: 4,
    relatedPortfolio: [],
  },
  {
    slug: "seo",
    name: "SEO",
    outcome: "Get found by customers the moment they start searching.",
    description:
      "Technical, on-page, and content SEO that compounds into durable organic traffic — not one-off spikes.",
    order: 5,
    relatedPortfolio: [],
  },
  {
    slug: "custom-software",
    name: "Software Solutions",
    outcome: "Replace busywork with software built around your business.",
    description:
      "Tools, automations, and apps that remove friction and scale operations as you grow.",
    order: 6,
    relatedPortfolio: [],
  },
]);
