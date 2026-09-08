import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin route guard + Supabase session refresh.
 *
 * Runs on /admin/* only, so public pages keep their static rendering path and
 * pay nothing for this. Two jobs:
 *   1. refresh the Supabase auth cookie so long admin sessions don't expire
 *      mid-edit
 *   2. bounce unauthenticated requests to /admin/login
 *
 * This is a convenience redirect, NOT the authorisation boundary. Server
 * Actions can be invoked directly without passing through middleware, so every
 * mutation independently calls `requireAdmin()`, and RLS backstops both.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() verifies the JWT against the auth server. getSession() only reads
  // the cookie and can be spoofed — never use it for a guard.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    // Preserve where they were headed so login can return them there.
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
