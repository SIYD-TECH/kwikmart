"use client";

// ProductGrid — fetches products in small batches instead of all at once.
//
// This is a CLIENT Component (note 'use client' above) — unlike page.js,
// this code runs in the browser, not on the server. That's what lets it
// react to button clicks and show live loading states.
//
// How the "reset when category changes" trick works: page.js renders this
// component with key={categorySlug}. Whenever that key changes, React
// throws away the old instance and mounts a brand new one — which means
// this component's state (products, offset, etc.) automatically resets
// to empty, and the loading skeleton shows again while it fetches fresh
// data. No extra reset logic needed.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import ProductCard from "@/app/components/ProductCard";

const PAGE_SIZE = 12;

export default function ProductGrid({ categoryId, excludeId }) {
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // true on first load / category switch
  const [isLoadingMore, setIsLoadingMore] = useState(false); // true only while "Load More" is fetching

  async function fetchPage(pageOffset, replace) {
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("id, name, slug, price, image_url, category_id")
      .order("name")
      .range(pageOffset, pageOffset + PAGE_SIZE - 1);

    if (categoryId) query = query.eq("category_id", categoryId);
    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load products:", error.message);
      setIsLoading(false);
      setIsLoadingMore(false);
      return;
    }

    setProducts((prev) => (replace ? data : [...prev, ...data]));
    setHasMore(data.length === PAGE_SIZE); // fewer results than a full page = nothing left
    setOffset(pageOffset + data.length);
    setIsLoading(false);
    setIsLoadingMore(false);
  }

  // Runs once when this component mounts (i.e. every time the category
  // changes, since a category change gives this component a fresh key).
  useEffect(() => {
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLoadMore() {
    setIsLoadingMore(true);
    fetchPage(offset, false);
  }

  // Loading skeleton — shown on first load and whenever the category changes
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl border border-border bg-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-text-muted">No products in this category yet.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mx-auto flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-2 text-sm font-semibold text-primary transition hover:bg-surface-muted disabled:opacity-60"
        >
          {isLoadingMore ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Loading...
            </>
          ) : (
            "Load More"
          )}
        </button>
      )}
    </div>
  );
}
