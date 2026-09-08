/**
 * Supabase environment access.
 *
 * Only the URL and the ANON key are ever read. There is deliberately no
 * service-role key in this application: every write is authorised by the
 * signed-in admin's session against RLS, so there is no god-key to leak.
 *
 * Next.js inlines NEXT_PUBLIC_* at build time, so these must be referenced as
 * full literal property accesses (not destructured from process.env).
 */
function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.local.example to .env.local and fill it in ` +
        `(run \`npx supabase status\` for local values).`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL",
);

export const SUPABASE_ANON_KEY = required(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);
