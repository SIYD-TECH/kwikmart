import { performAiSearch } from "@/app/Aisearch";
import ProductCard from "@/app/components/ProductCard";
import { Sparkles } from "lucide-react";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q?.trim();

  if (!query) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-text-muted">
        Type something into the search bar to get started — try describing what
        you need rather than just a product name.
      </div>
    );
  }

  const results = await performAiSearch(query);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles size={20} className="text-primary" />
        <h1 className="font-heading text-xl font-bold">
          Results for "{query}"
        </h1>
      </div>

      {results.length === 0 ? (
        <p className="text-text-muted">
          No matches found. Try describing what you're looking for differently,
          or browse by category instead.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
