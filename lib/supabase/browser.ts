"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Browser client. Used for exactly two things:
 *   1. the sign-in form on /admin/login
 *   2. direct-to-Storage file uploads (bypasses the 4.5MB Server Action body cap)
 *
 * All data mutations go through Server Actions instead, so the write surface
 * stays on the server where it can be validated.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
