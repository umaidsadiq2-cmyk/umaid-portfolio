import { capabilitySchema, type Capability } from "@/lib/schemas";
import { z } from "zod";

/**
 * The five offerings, presented as ONE social-first growth system.
 *
 * Each is framed by the business OUTCOME it produces, never a bare label
 * (FR-005) — `focus`, `tools` and `deliverables` then carry the specifics, so
 * the headline stays about the client while the detail proves the craft.
 */
export const services: Capability[] = z.array(capabilitySchema).parse([
  {
    slug: "social-media-marketing",
    name: "Social Media Marketing & Management",
    shortName: "Social Media Marketing",
    outcome: "Turn followers into a pipeline of paying customers.",
    description:
      "Paid and organic run as one system — Meta Ads that reach the right buyers, engagement that keeps them warm, and a posting rhythm that compounds instead of stalling.",
    focus: ["Meta Ads", "Organic engagement", "Posting & scheduling"],
    order: 0,
    relatedPortfolio: [],
  },
  {
    slug: "content-creation",
    name: "Content Creation",
    outcome: "Say the thing that makes them stop and read.",
    description:
      "Copy written for how people actually scroll — hooks that earn the first second, captions that hold it, and carousel and reel scripts built to land the point before the thumb moves.",
    focus: [
      "Caption copywriting",
      "Post copy",
      "Carousel scripts",
      "Video reel scripts",
    ],
    order: 1,
    relatedPortfolio: [],
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    outcome: "Look like the most trusted name in your category.",
    description:
      "Brand-consistent visuals across everything a business hands out or posts — the polish that makes you feel established before the first conversation.",
    tools: ["Adobe Photoshop", "Adobe Illustrator", "Canva", "AI"],
    deliverables: [
      "Posts",
      "Carousels",
      "Logos",
      "Business cards",
      "Banners",
      "Brochures",
    ],
    order: 2,
    relatedPortfolio: [],
  },
  {
    slug: "video-editing",
    name: "Video Editing",
    outcome: "Stop the scroll and hold attention to the last frame.",
    description:
      "Cut for retention, not just for tidiness — pacing, captions, and motion that earn watch-time, shares, and action.",
    tools: ["Adobe After Effects", "Wondershare Filmora", "AI-generated video"],
    deliverables: [
      "Reels",
      "Monologues",
      "Event video editing",
      "Message video editing",
    ],
    order: 3,
    relatedPortfolio: [],
  },
  {
    slug: "animation",
    name: "Animation",
    outcome: "Give your brand a signature that moves.",
    description:
      "Motion that makes an identity memorable — from a logo sting that tops every video to full 2D and AI-assisted 3D sequences.",
    focus: ["Logo animation", "2D animation", "3D AI animation"],
    order: 4,
    relatedPortfolio: [],
  },
]);
