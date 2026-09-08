"use client";

import { useId, useState } from "react";

/** Move `from` to `to`, returning a new array. Out-of-range indices are no-ops. */
export function moveWithin<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return list;
  const clamped = Math.max(0, Math.min(to, list.length - 1));
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(clamped, 0, moved!);
  return next;
}

/**
 * Reordering within a pinned/unpinned list.
 *
 * Pinned rows always render above unpinned ones, so moving must happen INSIDE a
 * row's own group — otherwise "move up" from the top of the unpinned group would
 * silently demote a pinned row. Returns the full list in render order (pinned
 * first), which is exactly what the reorder RPC expects.
 */
export function moveInGroup<T extends { id: string; pinned: boolean }>(
  rows: T[],
  id: string,
  delta: number | { toPosition: number },
): T[] {
  const pinned = rows.filter((r) => r.pinned);
  const unpinned = rows.filter((r) => !r.pinned);

  const inPinned = pinned.some((r) => r.id === id);
  const group = inPinned ? pinned : unpinned;
  const from = group.findIndex((r) => r.id === id);
  if (from === -1) return rows;

  const to =
    typeof delta === "number" ? from + delta : delta.toPosition - 1; // input is 1-based
  const moved = moveWithin(group, from, to);

  return inPinned ? [...moved, ...unpinned] : [...pinned, ...moved];
}

type Props = {
  /** 1-based position within the row's own group. */
  position: number;
  groupSize: number;
  disabled?: boolean;
  onMove: (delta: number) => void;
  onJump: (toPosition: number) => void;
};

/**
 * Up / down / jump-to-position.
 *
 * Chosen over drag-and-drop deliberately: no dependency, works with touch and
 * keyboard out of the box, and stays usable on a phone — where most quick
 * portfolio edits actually happen.
 */
export function ReorderControls({
  position,
  groupSize,
  disabled = false,
  onMove,
  onJump,
}: Props) {
  const [draft, setDraft] = useState(String(position));
  const inputId = useId();

  // Track the authoritative position when it changes underneath us.
  const [lastSeen, setLastSeen] = useState(position);
  if (lastSeen !== position) {
    setLastSeen(position);
    setDraft(String(position));
  }

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed) || parsed === position) {
      setDraft(String(position));
      return;
    }
    onJump(Math.max(1, Math.min(parsed, groupSize)));
  };

  const btn =
    "grid h-7 w-7 place-items-center rounded-sm border border-line-strong text-ink-soft " +
    "transition-colors hover:border-ink hover:bg-fog disabled:opacity-35 disabled:pointer-events-none";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={btn}
        disabled={disabled || position <= 1}
        onClick={() => onMove(-1)}
        aria-label="Move up"
        title="Move up"
      >
        <span aria-hidden>↑</span>
      </button>
      <button
        type="button"
        className={btn}
        disabled={disabled || position >= groupSize}
        onClick={() => onMove(1)}
        aria-label="Move down"
        title="Move down"
      >
        <span aria-hidden>↓</span>
      </button>
      <label htmlFor={inputId} className="sr-only">
        Position (1–{groupSize})
      </label>
      <input
        id={inputId}
        type="number"
        min={1}
        max={groupSize}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        title={`Position (1–${groupSize})`}
        className="h-7 w-12 rounded-sm border border-line-strong bg-canvas px-1.5 text-center text-xs tabular-nums focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20 disabled:opacity-35"
      />
    </div>
  );
}

/**
 * Two-step delete. An inline confirm rather than window.confirm: it can't be
 * suppressed by the browser's "prevent additional dialogs" checkbox, which
 * would otherwise make deletion silently impossible after a few uses.
 */
export function ConfirmDelete({
  label,
  disabled = false,
  onConfirm,
}: {
  label: string;
  disabled?: boolean;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setArmed(true)}
        className="h-7 rounded-sm px-2 text-xs font-medium text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-35"
        aria-label={`Delete ${label}`}
      >
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
        className="h-7 rounded-sm bg-red-600 px-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-35"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        className="h-7 rounded-sm px-2 text-xs font-medium text-muted hover:bg-fog"
      >
        Cancel
      </button>
    </span>
  );
}
