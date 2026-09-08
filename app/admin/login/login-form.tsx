"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/lib/cms/actions/auth";

const field =
  "h-11 w-full rounded-sm border border-line-strong bg-canvas px-3 text-sm text-ink " +
  "placeholder:text-muted/70 focus:border-emerald focus:outline-none focus:ring-2 focus:ring-emerald/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-sm bg-emerald text-sm font-medium text-white transition-colors duration-200 hover:bg-emerald-deep disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<AuthState, FormData>(signIn, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={field}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={field}
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
