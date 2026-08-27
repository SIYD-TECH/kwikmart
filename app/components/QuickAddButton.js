"use client";

// QuickAddButton — a small "add 1 to cart" button meant to sit inside a
// clickable product card. Used in two places: the grid's ProductCard, and
// the featured product on the shop page.
//
// The tricky part: this button lives INSIDE a <Link> (the whole card
// navigates to the product page when clicked). Without stopping the click
// here, tapping this button would both add to cart AND navigate away at
// the same time. e.preventDefault() + e.stopPropagation() stop the click
// from "bubbling up" to the Link around it.

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/Cartcontext";

export default function QuickAddButton({ product, className = "" }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = !product.stock_quantity || product.stock_quantity <= 0;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={outOfStock}
      aria-label={`Add ${product.name} to cart`}
      className={`flex items-center justify-center rounded-xl p-2 transition ${
        justAdded
          ? "bg-primary text-white"
          : "bg-secondary-light/30 text-secondary hover:bg-secondary-light hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      {justAdded ? <Check size={18} /> : <Plus size={18} />}
    </button>
  );
}
