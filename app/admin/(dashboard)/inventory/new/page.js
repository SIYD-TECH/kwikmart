import { createClient } from "@/lib/supabase/server";
import ProductForm from "../_components/ProductForm";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Add Product</h1>
      <ProductForm categories={categories} action={createProduct} />
    </div>
  );
}
