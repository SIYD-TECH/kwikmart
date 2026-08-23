import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Package, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductActions from "./_components/ProductActions";
import ProductCard from "@/app/components/ProductCard";

export const revalidate = 60; // Cache for 60 seconds

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient(); // server client — this is a Server Component

  // 1. Fetch current product with category data
  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories (id, name, slug)")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // 2. Fetch up to 4 related products in the same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, stock_quantity")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link
          href={`/?category=${product.categories?.slug}`}
          className="hover:text-primary transition-colors"
        >
          {product.categories?.name || "Category"}
        </Link>
        <ChevronRight size={14} />
        <span className="truncate text-primary font-bold">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-20">
        {/* Single Image Showcase */}
        <div className="md:col-span-6 lg:col-span-5">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-surface-variant bg-surface-container-lowest shadow-sm">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                priority
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-muted">
                <ShoppingBag size={48} />
                <span className="text-sm font-medium">No photo available</span>
              </div>
            )}

            <div className="absolute top-4 left-4 rounded-full bg-surface-container-lowest/90 px-3 py-1 text-xs font-bold text-primary shadow backdrop-blur-sm">
              {product.stock_quantity > 0 ? (
                <span className="flex items-center gap-1">
                  <Package size={14} /> In Stock ({product.stock_quantity} left)
                </span>
              ) : (
                <span className="text-error">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between md:col-span-6 lg:col-span-5">
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {product.categories?.name}
              </span>
              <h1 className="mt-1 text-2xl font-bold text-on-surface sm:text-3xl">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-primary">
                ₦{Number(product.price).toLocaleString()}
              </span>
            </div>

            <hr className="border-surface-variant" />

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-bold text-on-surface">
                About this item
              </h2>
              <p className="text-sm leading-relaxed text-on-surface-variant">
                {product.description ||
                  "Fresh, authentic grocery staple sourced for fast collection at our pickup store."}
              </p>
            </div>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      {/* Related Items Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-surface-variant pt-10">
          <h2 className="mb-6 text-xl font-bold text-on-surface">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
