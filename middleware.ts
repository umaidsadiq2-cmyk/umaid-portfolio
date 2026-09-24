import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Canonical host redirect + admin route guard + Supabase session refresh.
 *
 * Every request passes through for the host check, which is a couple of string
 * comparisons. Only /admin/* goes on to the Supabase work below, so public
 * pages still pay nothing for it. Three jobs:
 *   0. send the bare apex to www, the host every canonical tag declares
 *   1. refresh the Supabase auth cookie so long admin sessions don't expire
 *      mid-edit
 *   2. bounce unauthenticated requests to /admin/login
 *
 * This is a convenience redirect, NOT the authorisation boundary. Server
 * Actions can be invoked directly without passing through middleware, so every
 * mutation independently calls `requireAdmin()`, and RLS backstops both.
 */
export async function middleware(request: NextRequest) {
  /*
   * One canonical host. Every page declares https://www.umaidsadiq.com, so the
   * bare apex must not serve the same pages under a second address, or search
   * engines index both and split the ranking. Vercel used to do this redirect
   * in its domain settings; on Cloudflare the app owns it.
   */
  const host = request.headers.get("host") ?? "";
  if (host === "umaidsadiq.com") {
    const url = new URL(request.url);
    url.host = "www.umaidsadiq.com";
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // Everything below is the admin guard; public pages never reach it.
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next({ request });
  }

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
  // The apex redirect has to see every page, so the matcher covers the whole
  // site except Next's own asset routes, which carry no host decision.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
