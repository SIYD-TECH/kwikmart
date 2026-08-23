"use client";

// The cart icon in the header needs to know the current item count, which
// means it needs useCart() — and useCart() only works inside Client
// Components. layout.js itself is a Server Component (no 'use client'),
// so this one small piece gets carved out into its own file, the same
// pattern we used for ProductGrid: server-rendered page, with just the
// interactive/stateful sliver pulled into a separate client component.

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/Cartcontext";

export default function CartLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light"
    >
      <ShoppingCart size={18} />
      <span className="hidden md:inline">Cart</span>
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px] font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
