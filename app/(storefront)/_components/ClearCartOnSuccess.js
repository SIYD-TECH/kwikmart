"use client";

import { useCart } from "@/context/Cartcontext";
// Waits for the cart to finish loading from storage BEFORE clearing it.
// Without this wait, clearing and loading can happen in the wrong order —
// the cart gets cleared, then immediately overwritten by the old saved
// cart loading in right after. Waiting for isLoaded avoids that race.

import { useEffect } from "react";

export default function ClearCartOnSuccess() {
  const { clearCart, isLoaded } = useCart();

  useEffect(() => {
    if (isLoaded) {
      clearCart();
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
