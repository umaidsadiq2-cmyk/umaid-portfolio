"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MEETING_EVENT, type MeetingOpenDetail } from "@/lib/meeting";

/** Opens the site-wide "Create a meeting" dialog, optionally pre-selecting a service. */
export function openMeeting(service?: string) {
  window.dispatchEvent(
    new CustomEvent<MeetingOpenDetail>(MEETING_EVENT, { detail: { service } }),
  );
}

/**
 * Open on the PRESS for a mouse, not on the click.
 *
 * A browser only fires `click` when mousedown and mouseup land on the same
 * element. Smooth scrolling (Lenis) and the hero's scrubbed animation keep the
 * page moving for a moment after the wheel stops, so a button like the hero's
 * "Hire Me" could slide 30–100px between press and release and the click was
 * silently dropped, needing several presses. Opening on pointerdown makes the
 * first press count.
 *
 * Mouse only: on touch, pointerdown also starts a scroll gesture, so a finger
 * that merely lands on the button must not open the dialog. Touch and keyboard
 * (Enter / Space) keep using the normal click. preventDefault stops the
 * follow-up mouse events, so the dialog is not opened twice.
 */
function openOnMousePress(e: ReactPointerEvent, service?: string) {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  e.preventDefault();
  openMeeting(service);
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
      onPointerDown={(e) => openOnMousePress(e, service)}
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
    <button
      type="button"
      onPointerDown={(e) => openOnMousePress(e, service)}
      onClick={() => openMeeting(service)}
      className={className}
    >
      {children}
    </button>
  );
}
