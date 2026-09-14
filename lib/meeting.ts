import { z } from "zod";

/**
 * "Create a meeting" request — shared by the dialog (client) and the server
 * action, so both validate against exactly the same rules.
 */

/**
 * DOM event every "Create a meeting" trigger dispatches. A single MeetingDialog
 * mounted in the site chrome listens for it, so any button anywhere — including
 * inside server components — can open the form without prop drilling.
 */
export const MEETING_EVENT = "umaid:open-meeting";
export type MeetingOpenDetail = { service?: string };

/**
 * Kept as a plain list rather than derived from content/service-pages.ts:
 * that module carries every page's long-form copy, and importing it here would
 * ship all of it to the browser inside the dialog's bundle.
 */
export const MEETING_SERVICES = [
  "Social Media Marketing",
  "Meta Ads",
  "Graphic Design",
  "Video Editing",
  "AI Ads",
  "AI Development",
] as const;

export const ENGAGEMENTS = [
  {
    value: "monthly",
    label: "Monthly hire",
    hint: "Ongoing work on a fixed monthly retainer.",
  },
  {
    value: "project",
    label: "Project based",
    hint: "A one-time project with a defined scope.",
  },
] as const;

/** Quick-pick suggestions. Visitors can also type any amount of their own. */
export const MONTHLY_BUDGETS = [
  "Under $300",
  "$300 to $600",
  "$600 to $1,000",
  "$1,000 to $2,000",
  "$2,000+",
] as const;

export const PROJECT_BUDGETS = [
  "Under $200",
  "$200 to $500",
  "$500 to $1,000",
  "$1,000 to $3,000",
  "$3,000+",
] as const;

export const meetingSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z.string().trim().max(30).optional(),
    company: z.string().trim().max(120).optional(),
    country: z.string().trim().min(2, "Please enter your country").max(60),
    services: z
      .array(z.enum(MEETING_SERVICES))
      .min(1, "Select at least one service"),
    engagement: z.enum(["monthly", "project"], {
      errorMap: () => ({ message: "Choose how you would like to work together" }),
    }),
    monthlyBudget: z.string().trim().max(80).optional(),
    projectBudget: z.string().trim().max(80).optional(),
    message: z.string().trim().max(2000).optional(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a meeting date"),
    preferredTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a meeting time"),
    // The visitor's IANA time zone, detected in the browser — clients book
    // from many countries, so a bare time would be ambiguous.
    timezone: z.string().trim().max(80).optional(),
    // Honeypot — real visitors never see or fill it.
    company_website: z.string().max(0).optional(),
  })
  .superRefine((value, ctx) => {
    // Budgets are free text: a suggestion or any amount the visitor types.
    if (value.engagement === "monthly" && !value.monthlyBudget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["monthlyBudget"],
        message: "Enter your monthly budget",
      });
    }
    if (value.engagement === "project" && !value.projectBudget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["projectBudget"],
        message: "Enter your project budget",
      });
    }
  });

export type Meeting = z.infer<typeof meetingSchema>;

/** First message per field, keyed by field name. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Plain-text summary — the email body and the WhatsApp prefill share it. */
export function meetingSummary(d: Meeting): string {
  const monthly = d.engagement === "monthly";
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    d.phone ? `Phone / WhatsApp: ${d.phone}` : null,
    `Company: ${d.company || "Not provided"}`,
    `Country: ${d.country}`,
    `Services: ${d.services.join(", ")}`,
    `Work type: ${monthly ? "Monthly hire" : "Project based"}`,
    monthly
      ? `Monthly salary budget: ${d.monthlyBudget}`
      : `Project budget: ${d.projectBudget}`,
    `Preferred meeting: ${formatMeetingSlot(d.preferredDate, d.preferredTime)}${
      d.timezone ? ` (${d.timezone})` : ""
    }`,
    d.message ? `\nMessage:\n${d.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * "2026-09-20" + "15:30" → "Sunday, September 20, 2026 at 3:30 PM".
 * Formatted in UTC on purpose: the date string is a calendar day, not an
 * instant, so no time zone shift may move it to the day before or after.
 */
export function formatMeetingSlot(date: string, time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const day = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const hour12 = h % 12 || 12;
  return `${day} at ${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
