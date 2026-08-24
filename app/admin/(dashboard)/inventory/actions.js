"use server";

// A Server Action — a function that runs on the server but can be called
// directly from a form or button in a Client Component, without you having
// to manually build an API route for it. Next.js handles the plumbing.
//
// Uses the ADMIN client deliberately: our RLS policies only allow the
// public to READ products, not delete them. Deletion is only ever
// performed here, server-side, after middleware has already confirmed
// the person is a logged-in admin.

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteProduct(productId) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error("Failed to delete product: " + error.message);
  }

  // Tells Next.js "the inventory page's data is now stale, re-fetch it
  // next time it's visited" — without this, the deleted product would
  // keep appearing until a hard refresh.
  revalidatePath("/admin/inventory");
}
