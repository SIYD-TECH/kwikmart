import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  XCircle,
  Layers,
} from "lucide-react";
import DeleteProductButton from "./_components/DeleteProductButton";

const PAGE_SIZE = 10;
const LOW_STOCK_THRESHOLD = 10;

export default async function InventoryPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search?.trim() || "";
  const categorySlug = params?.category || "";
  const page = Math.max(1, parseInt(params?.page) || 1);

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const activeCategory = categorySlug
    ? categories?.find((c) => c.slug === categorySlug)
    : null;

  // Stats — real counts, computed with { count: 'exact', head: true }, which
  // asks Supabase for JUST the count, not the actual rows. Much cheaper
  // than fetching everything and counting it ourselves in JavaScript.
  const [totalRes, lowStockRes, outOfStockRes] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("stock_quantity", 0)
      .lte("stock_quantity", LOW_STOCK_THRESHOLD),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock_quantity", 0),
  ]);

  // Product list, filtered + paginated
  let query = supabase
    .from("products")
    .select(
      "id, name, price, stock_quantity, image_url, categories(name, slug)",
      {
        count: "exact",
      },
    )
    .order("name")
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) query = query.ilike("name", `%${search}%`);
  if (activeCategory) query = query.eq("category_id", activeCategory.id);

  const { data: products, count: filteredCount } = await query;
  const totalPages = Math.max(1, Math.ceil((filteredCount || 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Inventory Management
          </h1>
          <p className="text-sm text-text-muted">
            Manage your products, stock levels, and pricing.
          </p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-light"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Stats — real numbers, not placeholders */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Products"
          value={totalRes.count ?? 0}
          color="text-primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockRes.count ?? 0}
          color="text-secondary"
        />
        <StatCard
          icon={XCircle}
          label="Out of Stock"
          value={outOfStockRes.count ?? 0}
          color="text-red-500"
        />
        <StatCard
          icon={Layers}
          label="Categories"
          value={categories?.length ?? 0}
          color="text-primary"
        />
      </div>

      {/* Search + category filter — plain form, same no-JS pattern as the
          storefront's track-order search: submitting just navigates with
          query params, which this page reads and filters by. */}
      <form className="mb-0 flex flex-col gap-4 rounded-t-2xl border border-b-0 border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="w-full rounded-xl border-2 border-border bg-surface-muted py-2 pl-10 pr-3 outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            href="/admin/inventory"
            active={!categorySlug}
            label="All"
          />
          {categories?.map((c) => (
            <FilterPill
              key={c.id}
              href={`/admin/inventory?category=${c.slug}`}
              active={categorySlug === c.slug}
              label={c.name}
            />
          ))}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-b-2xl border border-border bg-surface">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase text-text-muted">
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((product) => (
              <tr key={product.id} className="group hover:bg-surface-muted">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <p className="font-semibold">{product.name}</p>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-text-muted">
                  {product.categories?.name}
                </td>
                <td className="px-6 py-3 font-semibold">
                  ₦{Number(product.price).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-sm text-text-muted">
                  {product.stock_quantity}
                </td>
                <td className="px-6 py-3">
                  <StockBadge quantity={product.stock_quantity} />
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                    <Link
                      href={`/admin/inventory/${product.id}/edit`}
                      className="rounded-full p-2 text-text-muted transition hover:bg-surface hover:text-primary"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {products?.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-text-muted"
                >
                  No products match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between px-2 text-sm text-text-muted">
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filteredCount || 0)} of{" "}
          {filteredCount || 0}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/inventory?page=${p}${categorySlug ? `&category=${categorySlug}` : ""}${
                search ? `&search=${search}` : ""
              }`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border hover:bg-surface-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-text-muted">
        <Icon size={18} className={color} /> {label}
      </div>
      <span className="font-heading text-2xl font-bold">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

function FilterPill({ href, active, label }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-primary text-white"
          : "bg-surface-muted text-text-muted hover:bg-border"
      }`}
    >
      {label}
    </Link>
  );
}

function StockBadge({ quantity }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
        <span className="h-2 w-2 rounded-full bg-red-500" /> Out of Stock
      </span>
    );
  }
  if (quantity <= LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <span className="h-2 w-2 rounded-full bg-amber-500" /> Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      <span className="h-2 w-2 rounded-full bg-primary" /> In Stock
    </span>
  );
}
