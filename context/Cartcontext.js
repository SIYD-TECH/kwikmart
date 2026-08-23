"use client";

// CartContext — the single place cart state lives.
//
// WHY A "CONTEXT" AT ALL: several completely separate pieces of the app
// need to read or change the cart — the header's cart icon (needs the item
// count), the product page's "Add to Cart" button, and the cart page
// itself. Passing cart data down through props from component to component
// would mean threading it through many files that don't otherwise care
// about it. Context is React's way of saying "this piece of state is
// available to any component that asks for it, no matter how deeply
// nested" — any component can call useCart() and get the current cart.
//
// WHY localStorage: this is a guest checkout store — there's no logged-in
// customer account to attach a cart to. Saving to the browser's
// localStorage means the cart survives a page refresh or closing the tab,
// without needing a database table or login. It only lives on this one
// device/browser, which is the right tradeoff for a guest cart.

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kwikmart-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // On first render in the browser, load whatever was saved last time.
  // This runs once, after the page has already rendered — localStorage
  // doesn't exist on the server, so we can't read it any earlier than this.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // Corrupted or missing data — just start with an empty cart.
    }
    setIsLoaded(true);
  }, []);

  // Every time the cart changes, save it back to localStorage.
  // The isLoaded check matters: without it, this would run once BEFORE
  // the load-from-storage effect above finishes, overwriting the saved
  // cart with an empty array the instant the page opens.
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isLoaded]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        const newQuantity = Math.min(
          existing.quantity + quantity,
          product.stock_quantity,
        );
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        );
      }

      // Snapshot just what the cart/checkout UI needs to display —
      // avoids re-fetching product details later just to render the cart.
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
          quantity: Math.min(quantity, product.stock_quantity),
        },
      ];
    });
  }

  function removeFromCart(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateQuantity(id, quantity) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const clamped = Math.max(1, Math.min(quantity, item.stock_quantity));
        return { ...item, quantity: clamped };
      }),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a <CartProvider>");
  }
  return context;
}
