"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MEETING_EVENT, type MeetingOpenDetail } from "@/lib/meeting";

/** Opens the site-wide "Create a meeting" dialog, optionally pre-selecting a service. */
export function openMeeting(service?: string) {
  window.dispatchEvent(
    new CustomEvent<MeetingOpenDetail>(MEETING_EVENT, { detail: { service } }),
  );
}

/** Primary "Create a meeting" button — same look as every other site Button. */
export function MeetingButton({
  children = "Create a meeting",
  service,
  size,
  variant,
  className,
  arrow,
}: {
  children?: ReactNode;
  service?: string;
  size?: "md" | "lg";
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  arrow?: boolean;
}) {
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      arrow={arrow}
      onClick={() => openMeeting(service)}
    >
      {children}
    </Button>
  );
}

/** Text-link styled trigger, for places that used a plain link (footer, contact aside). */
export function MeetingTextButton({
  children = "Create a meeting",
  service,
  className,
}: {
  children?: ReactNode;
  service?: string;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => openMeeting(service)} className={className}>
      {children}
    </button>
  );
}
