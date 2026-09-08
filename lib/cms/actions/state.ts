/**
 * Form-action result shape, shared by Server Actions and the client components
 * that render their output.
 *
 * Kept in its own module with no server-only imports: a client component that
 * needs `IDLE` as the initial `useActionState` value must be able to import it
 * without dragging `next/cache` into the browser bundle.
 */
export type ActionState = {
  ok: boolean;
  error: string | null;
  /** Per-field messages keyed by input name. */
  fieldErrors?: Record<string, string>;
};

export const IDLE: ActionState = { ok: false, error: null };

export function failure(
  error: string,
  fieldErrors?: Record<string, string>,
): ActionState {
  return { ok: false, error, fieldErrors };
}

export function success(): ActionState {
  return { ok: true, error: null };
}
