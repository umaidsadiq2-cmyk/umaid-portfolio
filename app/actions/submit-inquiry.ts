"use server";

import { inquirySchema } from "@/lib/schemas";

export type InquiryResult =
  | { ok: true }
  | {
      ok: false;
      error: "validation" | "spam" | "send_failed";
      fieldErrors?: Record<string, string>;
    };

/**
 * Server-side conversion handler. Re-validates with the shared schema (never
 * trusts the client), rejects honeypot hits, and delivers via Resend. Secrets
 * stay server-side. If RESEND_API_KEY is absent (local/dev), it logs and
 * succeeds so the flow is testable without keys.
 */
export async function submitInquiry(raw: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "validation", fieldErrors };
  }

  const data = parsed.data;

  // Honeypot — silently drop bots.
  if (data.company_website && data.company_website.length > 0) {
    return { ok: false, error: "spam" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !to || !from) {
    // Dev/local fallback: no email provider configured.
    console.info("[inquiry] (no Resend configured) received:", {
      name: data.name,
      email: data.email,
      company: data.company,
      serviceInterest: data.serviceInterest,
      budget: data.budget,
    });
    return { ok: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New inquiry — ${data.name}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Company: ${data.company ?? "—"}`,
        `Service: ${data.serviceInterest ?? "—"}`,
        `Budget: ${data.budget ?? "—"}`,
        "",
        data.message,
      ].join("\n"),
    });
    if (error) {
      console.error("[inquiry] resend error", error);
      return { ok: false, error: "send_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return { ok: false, error: "send_failed" };
  }
}
