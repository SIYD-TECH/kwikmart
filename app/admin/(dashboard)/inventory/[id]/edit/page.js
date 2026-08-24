import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "../../_components/ProductForm";
import { updateProduct } from "../../actions";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold">Edit Product</h1>
      {/* .bind(null, id) pre-fills updateProduct's first argument with this
          product's id, so ProductForm can call action(formData) without
          needing to know the id itself — it's already baked in. */}
      <ProductForm
        categories={categories}
        initialData={product}
        action={updateProduct.bind(null, id)}
      />
    </div>
  );
}
