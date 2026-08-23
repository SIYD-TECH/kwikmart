import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-40 bg-surface-muted p-3">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-3 transition group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-text-muted">
            No image
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-heading text-lg font-bold text-primary">
            ₦{Number(product.price).toLocaleString()}
          </span>
          <span className="flex items-center justify-center rounded-xl bg-secondary-light/30 p-2 text-secondary transition group-hover:bg-secondary-light group-hover:text-white">
            <Plus size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
