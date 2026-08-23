import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  Sprout,
  Wheat,
  Soup,
  Beef,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import ProductGrid from "./(storefront)/_components/ProductGrid";

const categoryIcons = {
  "Fresh Produce": Sprout,
  "Grains & Staples": Wheat,
  "Seasoning & Spices": Soup,
  "Frozen & Meat/Fish": Beef,
};

export default async function ShopPage({ searchParams }) {
  const supabase = await createClient();
  const params = await searchParams;
  const activeCategorySlug = params?.category;

  // Categories are a small list — safe to fetch fully on the server, fast.
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const activeCategory = activeCategorySlug
    ? categories?.find((c) => c.slug === activeCategorySlug)
    : null;

  // Featured product: one targeted query (highest price in the current
  // view), NOT the full product list — keeps this fast regardless of
  // catalog size, and stays independent of the paginated grid below.
  let featuredQuery = supabase
    .from("products")
    .select("id, name, slug, price, image_url, stock_quantity")
    .order("price", { ascending: false })
    .limit(1);

  if (activeCategory) {
    featuredQuery = featuredQuery.eq("category_id", activeCategory.id);
  }

  const { data: featuredResults } = await featuredQuery;
  const featured = featuredResults?.[0] ?? null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
      {/* Category sidebar */}
      <aside className="w-full shrink-0 rounded-2xl bg-surface p-4 shadow-sm md:w-64">
        <h2 className="mb-3 font-heading text-lg font-bold text-primary">
          Welcome to the Market
        </h2>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              !activeCategorySlug
                ? "bg-secondary-light/30 text-secondary"
                : "text-text-muted hover:bg-surface-muted"
            }`}
          >
            <LayoutGrid size={18} /> All Categories
          </Link>
          {categories?.map((category) => {
            const Icon = categoryIcons[category.name] || Sprout;
            const isActive = activeCategorySlug === category.slug;
            return (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-secondary-light/30 text-secondary"
                    : "text-text-muted hover:bg-surface-muted"
                }`}
              >
                <Icon size={18} /> {category.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Hero banner */}
        <section className="mb-8 flex h-56 items-center justify-center rounded-2xl bg-primary-light px-6 text-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
              Freshness Delivered to Your Pickup Point
            </h1>
            <p className="mt-2 text-white/90">
              Real Nigerian groceries, ready when you are.
            </p>
          </div>
        </section>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-primary">
              {activeCategory ? activeCategory.name : "Fresh Picks for You"}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Featured product — fetched separately, shown above the batch-loaded grid */}
          {featured && (
            <Link
              href={`/products/${featured.slug}`}
              className="group flex overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-1 flex-col justify-center p-4">
                <span className="mb-2 w-max rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white">
                  Featured
                </span>
                <h3 className="font-heading text-lg font-bold">
                  {featured.name}
                </h3>
                <span className="mt-2 font-heading text-xl font-bold text-primary">
                  ₦{Number(featured.price).toLocaleString()}
                </span>
                <span className="mt-3 flex w-max items-center gap-1 text-sm font-semibold text-secondary group-hover:underline">
                  View product <ArrowRight size={14} />
                </span>
              </div>
              {featured.image_url && (
                <div className="relative w-1/2">
                  <Image
                    src={featured.image_url}
                    alt={featured.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
              )}
            </Link>
          )}

          {/* key={activeCategorySlug} forces this to remount (and reset its
              loading state) every time the category changes */}
          <ProductGrid
            key={activeCategorySlug || "all"}
            categoryId={activeCategory?.id ?? null}
            excludeId={featured?.id ?? null}
          />
        </div>
      </div>
    </div>
  );
}
