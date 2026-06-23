import { trustSignalSchema, type TrustSignal } from "@/lib/schemas";
import { z } from "zod";

/**
 * Client logos are committed for v1. Testimonials and results are architected in
 * (discriminated union) and slot in with zero layout change once supplied —
 * strongly recommended before launch as the highest-impact B2B trust signals.
 */
export const trustSignals: TrustSignal[] = z.array(trustSignalSchema).parse([
  {
    type: "logo",
    order: 0,
    logo: { name: "Aurora Clinic", src: "/trust/aurora.svg", alt: "Aurora Clinic" },
  },
  {
    type: "logo",
    order: 1,
    logo: { name: "Northwind Travel", src: "/trust/northwind.svg", alt: "Northwind Travel" },
  },
  {
    type: "logo",
    order: 2,
    logo: { name: "Forge Apparel", src: "/trust/forge.svg", alt: "Forge Apparel" },
  },
  {
    type: "logo",
    order: 3,
    logo: { name: "Meridian", src: "/trust/meridian.svg", alt: "Meridian" },
  },
  // Example shapes ready for real data:
  {
    type: "result",
    order: 4,
    result: { metric: "2.4×", label: "more consultations", context: "Aurora Clinic, Q1" },
  },
  {
    type: "result",
    order: 5,
    result: { metric: "+38%", label: "engaged followers", context: "Northwind, 90 days" },
  },
]);

export const trustLogos = trustSignals.filter((t) => t.type === "logo");
export const trustResults = trustSignals.filter((t) => t.type === "result");
