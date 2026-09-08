import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-bound Supabase client for Server Components and Server Actions in the
 * admin area. Carries the signed-in admin's session, so RLS grants write access.
 *
 * Uses the anon key — authority comes from the session cookie, not the key.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: middleware refreshes the session on every request.
        }
      },
    },
  });
}

/**
 * Returns the signed-in admin, or null.
 *
 * Always uses `getUser()` rather than `getSession()` — getSession reads the
 * cookie without verifying it against the auth server, so it can be spoofed.
 * Every Server Action must call this; middleware alone is not an authorisation
 * boundary (it can be bypassed by direct Action invocation).
 */
export async function getAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/** Throws unless a verified admin session is present. Guards every mutation. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("Unauthorised — please sign in again.");
  return user;
}
