"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { makeUniqueSlug } from "@/lib/slugify";
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

  revalidatePath("/admin/inventory");
}

function validateProductFields(fields) {
  const errors = {};
  if (!fields.name?.trim()) errors.name = "Product name is required";
  if (!fields.category_id) errors.category_id = "Choose a category";
  if (!fields.price || Number(fields.price) < 0)
    errors.price = "Enter a valid price";
  if (fields.stock_quantity === "" || Number(fields.stock_quantity) < 0) {
    errors.stock_quantity = "Enter a valid stock quantity";
  }
  return errors;
}

export async function createProduct(formData) {
  const fields = Object.fromEntries(formData);
  const errors = validateProductFields(fields);
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = createAdminClient();
  const slug = await makeUniqueSlug(supabase, fields.name);

  const { error } = await supabase.from("products").insert({
    name: fields.name.trim(),
    slug,
    category_id: fields.category_id,
    price: Number(fields.price),
    stock_quantity: Number(fields.stock_quantity),
    description: fields.description?.trim() || null,
    image_url: fields.image_url?.trim() || null,
  });

  if (error) return { errors: { form: error.message } };

  revalidatePath("/admin/inventory");
  // No redirect() here anymore — the client (ProductForm) shows a success
  // toast first, THEN navigates. Redirecting from inside the action would
  // leave no moment for a toast to appear before the page changes.
  return { success: true };
}

export async function updateProduct(productId, formData) {
  const fields = Object.fromEntries(formData);
  const errors = validateProductFields(fields);
  if (Object.keys(errors).length > 0) return { errors };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: fields.name.trim(),
      category_id: fields.category_id,
      price: Number(fields.price),
      stock_quantity: Number(fields.stock_quantity),
      description: fields.description?.trim() || null,
      image_url: fields.image_url?.trim() || null,
    })
    .eq("id", productId);

  if (error) return { errors: { form: error.message } };

  revalidatePath("/admin/inventory");
  return { success: true };
}
