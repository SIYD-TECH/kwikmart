// DANGER: uses the service_role key, which BYPASSES Row Level Security
// entirely — full read/write access to every table, no restrictions.
//
// Only ever import this in server-only code: the seed script, or admin-panel
// route handlers where you've already verified the request is from a logged-in
// admin. NEVER import this into a 'use client' file or anything that could
// end up in a browser bundle — that would leak full database access to
// anyone who opens devtools.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
