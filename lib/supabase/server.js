// Used in Server Components, Server Actions, and route handlers (files WITHOUT
// 'use client') — e.g. checking "is this person logged in as admin" before
// rendering an admin page. Still uses the anon key (still respects RLS),
// but it's cookie-aware, so it knows *who* is making the request based on
// their session — unlike the plain browser client.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll can be called from a Server Component, where cookies
            // can't be set. Safe to ignore if you have middleware refreshing
            // sessions — harmless no-op otherwise for our use case.
          }
        },
      },
    },
  );
}
