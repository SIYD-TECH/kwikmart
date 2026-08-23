"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  ShoppingBasket,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from "lucide-react";
//import { useCart } from "@/context/CartContext"; // Adjust to your cart hook/context path

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
//   const { addToCart } = useCart?.() || { addToCart: () => {} };

  const isOutOfStock = product.stock_quantity <= 0;

  function handleQuantityChange(delta) {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > product.stock_quantity) return product.stock_quantity;
      return next;
    });
  }

//   function handleAddToCart() {
//     if (isOutOfStock) return;
//     addToCart(product, quantity);
//     setIsAdded(true);
//     setTimeout(() => setIsAdded(false), 1800);
//   }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between rounded-xl bg-surface-container p-3">
        <span className="text-sm font-semibold text-on-surface-variant">
          Quantity
        </span>
        <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-1 shadow-inner">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-container disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
          <span className="min-w-[2.5ch] text-center font-bold text-on-surface">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock_quantity || isOutOfStock}
            className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-colors hover:bg-surface-container disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        type="button"
        // onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-md transition-all active:scale-[0.99] ${
          isOutOfStock
            ? "cursor-not-allowed bg-surface-container text-text-muted"
            : isAdded
              ? "bg-secondary text-white"
              : "bg-primary text-on-primary hover:bg-surface-tint"
        }`}
      >
        <ShoppingBasket size={20} />
        {isOutOfStock
          ? "Out of Stock"
          : isAdded
            ? "Added to Cart!"
            : "Add to Cart"}
      </button>

      {/* Honest Store Trust Signals */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 text-xs font-semibold text-on-surface-variant">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary flex-shrink-0" />
          <span>Pickup available at 14 Allen Avenue, Ikeja, Lagos</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary flex-shrink-0" />
          <span>Verified quality staple & authentic packaging</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
          <span>Instant checkout & payment tracking via Paystack</span>
        </div>
      </div>
    </div>
  );
}
