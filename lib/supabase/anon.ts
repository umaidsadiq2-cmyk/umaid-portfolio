import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-less anon client for PUBLIC page reads.
 *
 * Why this exists separately from `./server`: public reads are wrapped in
 * `unstable_cache`, which forbids dynamic APIs like `cookies()`. A cookie-bound
 * client would throw in that context. This one carries no session at all, which
 * is also exactly right semantically — public pages must render the same HTML
 * for everyone, so they should see only what an anonymous visitor can see
 * (published rows, per RLS).
 *
 * Never use this for writes; RLS will reject them.
 */
export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
