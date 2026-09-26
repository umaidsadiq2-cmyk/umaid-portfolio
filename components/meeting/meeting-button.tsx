"use client";

import { useRef } from "react";
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { MEETING_EVENT, type MeetingOpenDetail } from "@/lib/meeting";

/** Opens the site-wide "Create a meeting" dialog, optionally pre-selecting a service. */
export function openMeeting(service?: string) {
  window.dispatchEvent(
    new CustomEvent<MeetingOpenDetail>(MEETING_EVENT, { detail: { service } }),
  );
}

/** A finger that travels this far was scrolling the page, not pressing a button. */
const SLIDE_TOLERANCE_PX = 24;

/**
 * Press handling that does not depend on the button staying still.
 *
 * The browser only fires `click` when the press and the release hit-test to the
 * same element. In the hero the button lives on a slide that is still easing
 * while the page settles, so it could move out from under the pointer between
 * the two, and the click was dropped: the visitor pressed several times before
 * anything happened.
 *
 * Pointer capture removes the hit test from the equation. From the moment of
 * the press the button owns that pointer, so the release is delivered to it
 * wherever the pointer (or the button) has since moved. Opening on the release
 * rather than the press keeps the familiar feel of a button, works the same for
 * mouse, pen and touch, and leaves nothing behind for the browser to retarget.
 *
 * Touch scrolling still wins: a drag past SLIDE_TOLERANCE_PX, or a gesture the
 * browser claims for scrolling (pointercancel), never opens the dialog.
 */
function usePressToOpen(service?: string) {
  const press = useRef<{ id: number; x: number; y: number } | null>(null);

  return {
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      // Left button only for a mouse; any contact for touch and pen.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      press.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Capture is a refinement, not a requirement: without it the release
        // still reaches the button as long as it has not moved.
      }
    },
    onPointerUp(e: ReactPointerEvent<HTMLElement>) {
      const started = press.current;
      press.current = null;
      if (!started || started.id !== e.pointerId) return;
      const travelled = Math.hypot(e.clientX - started.x, e.clientY - started.y);
      if (travelled > SLIDE_TOLERANCE_PX) return;
      openMeeting(service);
    },
    onPointerCancel() {
      press.current = null;
    },
    onClick(e: ReactMouseEvent<HTMLElement>) {
      // Enter and Space arrive as a click with no pointer behind it (detail 0).
      // Pointer-driven clicks were already handled on the release above.
      if (e.detail === 0) openMeeting(service);
    },
  };
}

/** Primary "Create a meeting" button, same look as every other site Button. */
export function MeetingButton({
  children = "Create a meeting",
  service,
  size,
  variant,
  className,
  arrow,
  magnetic,
}: {
  children?: ReactNode;
  service?: string;
  size?: "md" | "lg";
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  arrow?: boolean;
  magnetic?: boolean;
}) {
  const press = usePressToOpen(service);
  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      arrow={arrow}
      magnetic={magnetic}
      {...press}
    >
      {children}
    </Button>
  );
}

/**
 * A little breathing room around a MeetingButton: a press that lands just
 * outside the button still opens the dialog. Presses that start on the button
 * are left to the button itself, so the dialog never opens twice.
 */
export function MeetingPressArea({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const press = usePressToOpen();
  return (
    <div
      className={className}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        press.onPointerDown(e);
      }}
      onPointerUp={press.onPointerUp}
      onPointerCancel={press.onPointerCancel}
    >
      {children}
    </div>
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
  const press = usePressToOpen(service);
  return (
    <button type="button" className={className} {...press}>
      {children}
    </button>
  );
}
