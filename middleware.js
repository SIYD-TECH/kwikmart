// middleware.js (project ROOT — not inside app/)
//
// Middleware runs BEFORE a page even starts rendering — it's the earliest
// point we can intercept a request. That makes it the right place for
// "is this person allowed to be here at all" checks, rather than
// discovering it's an unauthorized visitor only after the page has
// already started loading.

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  // Not logged in, trying to reach a protected admin page → send to login
  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Already logged in, but sitting on the login page → send to the dashboard
  // (no reason to show someone a login form they're already past)
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

// Only run this middleware for /admin routes — running it on every single
// page (storefront included) would slow down every request for no reason.
export const config = {
  matcher: ["/admin/:path*"],
};
