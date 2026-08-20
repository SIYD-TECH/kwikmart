// Used in Client Components ('use client' files) — e.g. the cart, search box,
// anything that runs in the browser. Uses the anon key, so it respects
// Row Level Security: it can only do what you've explicitly allowed for
// public/anonymous access (read products, create an order, etc).

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
