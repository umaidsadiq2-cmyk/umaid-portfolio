import { profileSchema, type Profile } from "@/lib/schemas";

/**
 * Placeholder-but-real copy. Swap imagery/figures for final assets before launch;
 * shape is locked by the schema so nothing downstream breaks.
 */
export const profile: Profile = profileSchema.parse({
  name: "Muhammad Umaid Sadiq",
  title: "Digital Growth Partner",
  tagline:
    "I build and grow the entire digital presence of ambitious businesses — under one standard.",
  bio: "I help founders and teams turn a scattered online presence into a system that compounds. From the first design to the last line of code, everything is built to one standard: yours, raised.",
  philosophy:
    "Great digital work isn't a stack of services — it's one coherent system. When design, content, web, and SEO pull in the same direction, growth stops being a guess.",
  expertise: [
    "Brand & Visual Identity",
    "Content Strategy",
    "Web Development",
    "SEO",
    "Video & Motion",
    "Marketing Automation",
  ],
  process: [
    {
      order: 0,
      title: "Listen",
      description:
        "We start with your business, not a template — goals, customers, and what growth actually means for you.",
    },
    {
      order: 1,
      title: "Design the system",
      description:
        "A single plan across brand, content, web, and SEO so every piece reinforces the others.",
    },
    {
      order: 2,
      title: "Build to standard",
      description:
        "Production-grade work — fast, accessible, on-brand — shipped without cutting corners.",
    },
    {
      order: 3,
      title: "Grow & refine",
      description:
        "We measure what matters and compound it, turning early wins into durable momentum.",
    },
  ],
  avatar: {
    poster: {
      src: "/avatar/umaid-poster.jpg",
      alt: "Portrait of Muhammad Umaid Sadiq",
      width: 720,
      height: 900,
    },
  },
  socials: [
    { platform: "LinkedIn", url: "https://www.linkedin.com/", label: "LinkedIn" },
    { platform: "Instagram", url: "https://www.instagram.com/", label: "Instagram" },
  ],
  location: "Working with businesses across Pakistan, USA, UK, Canada & UAE",
});
