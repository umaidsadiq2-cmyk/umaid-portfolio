"use server";

import { fieldErrorsOf, meetingSchema, meetingSummary } from "@/lib/meeting";

export type MeetingResult =
  | { ok: true; emailed: boolean }
  | { ok: false; error: "validation" | "send_failed"; fieldErrors?: Record<string, string> };

/**
 * Server-side handler for "Create a meeting". Re-validates with the shared
 * schema (never trusts the client) and delivers via Resend, using the same
 * environment variables as the contact form.
 *
 * `emailed: false` means no email provider is configured. The dialog then
 * leans on its WhatsApp hand-off, so the visitor always has a way to reach
 * Umaid even when email delivery is not set up.
 */
export async function submitMeeting(raw: unknown): Promise<MeetingResult> {
  const parsed = meetingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const data = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !to || !from) {
    console.info("[meeting] (no Resend configured) received:\n" + meetingSummary(data));
    return { ok: true, emailed: false };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New meeting request from ${data.name}${data.company ? ` (${data.company})` : ""}`,
      text: meetingSummary(data),
    });
    if (error) {
      console.error("[meeting] resend error", error);
      return { ok: false, error: "send_failed" };
    }
    return { ok: true, emailed: true };
  } catch (err) {
    console.error("[meeting] send failed", err);
    return { ok: false, error: "send_failed" };
  }
}
