"use client";

import { useCart } from "@/context/Cartcontext";
import {
  Plus,
  Minus,
  ShoppingBasket,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function ProductActions({ product }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  // The quantity shown here comes DIRECTLY from the cart — not a separate
  // local counter. This is the single source of truth: if it's not in the
  // cart, quantityInCart is 0 and we show "Add to Cart". Once it's in the
  // cart, we show the stepper reflecting the real cart quantity.
  const cartItem = items.find((item) => item.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock_quantity <= 0;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToCart(product, 1);
  }

  function handleDecrease() {
    if (quantityInCart <= 1) {
      // Going below 1 means "remove it" — there's no such thing as
      // 0 of an item sitting in the cart.
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, quantityInCart - 1);
    }
  }

  function handleIncrease() {
    updateQuantity(product.id, quantityInCart + 1);
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      {quantityInCart === 0 ? (
        // Nothing in cart yet — just the Add to Cart button
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-md transition-all active:scale-[0.99] ${
            isOutOfStock
              ? "cursor-not-allowed bg-surface-container text-text-muted"
              : "bg-primary text-on-primary hover:bg-surface-tint"
          }`}
        >
          <ShoppingBasket size={20} />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>
      ) : (
        // Already in cart — the button "becomes" a quantity stepper
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-primary p-2">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/20"
            >
              <Minus size={20} />
            </button>
            <span className="font-bold text-white">
              {quantityInCart} in cart
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantityInCart >= product.stock_quantity}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/20 disabled:opacity-40"
            >
              <Plus size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            className="flex items-center justify-center gap-1 text-sm font-semibold text-red-600 hover:underline"
          >
            <Trash2 size={14} /> Remove from cart
          </button>
        </div>
      )}

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
