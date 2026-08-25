"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/Cartcontext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, itemCount } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-text-muted" />
        <h1 className="font-heading text-xl font-bold">Your cart is empty</h1>
        <p className="text-text-muted">
          Add a few things from the shop to get started.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-heading text-3xl font-bold text-primary">
        Your Cart
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 sm:p-4 shadow-sm"
            >
              {/* Compact Image */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted sm:h-20 sm:w-20 sm:rounded-xl">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 56px, 80px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-text-muted">
                    No image
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="block truncate text-xs font-semibold hover:underline sm:text-sm"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 font-heading text-xs font-bold text-primary sm:text-sm">
                  ₦{Number(item.price).toLocaleString()}
                </p>
              </div>

              {/* Inline Controls (Quantity & Trash) */}
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div className="flex items-center overflow-hidden rounded-full bg-surface-muted">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 sm:p-2 text-primary transition hover:bg-border disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} className="sm:h-4 sm:w-4" />
                  </button>
                  <span className="w-5 text-center text-xs font-semibold sm:w-8 sm:text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock_quantity}
                    className="p-1 sm:p-2 text-primary transition hover:bg-border disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} className="sm:h-4 sm:w-4" />
                  </button>
                </div>

                {/* Remove Action: Icon-only on mobile, text on desktop */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-red-600 transition hover:bg-red-50 hover:rounded-lg sm:p-0 sm:hover:underline sm:flex sm:items-center sm:gap-1 text-xs font-semibold"
                  aria-label="Remove item"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary — sticky on desktop so it stays visible while scrolling the item list */}
        <aside className="w-full shrink-0 lg:w-96">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="mb-4 border-b border-border pb-3 font-heading text-lg font-bold">
              Order Summary
            </h2>

            <div className="flex justify-between text-sm text-text-muted">
              <span>
                Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </span>
              <span className="font-semibold text-text">
                ₦{Number(subtotal).toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="font-heading text-lg font-bold">Total</span>
              <span className="font-heading text-2xl font-bold text-primary">
                ₦{Number(subtotal).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Pickup only — no delivery fee.
            </p>

            <Link
              href="/checkout"
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-light"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-center text-xs text-text-muted">
              Secure payment powered by Paystack
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
