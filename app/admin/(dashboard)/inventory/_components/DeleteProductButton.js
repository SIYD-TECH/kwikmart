"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

export default function DeleteProductButton({ productId, productName }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Native browser confirm() — simple and sufficient for an internal
    // admin tool. A destructive action like this should never fire on a
    // single accidental click.
    const confirmed = window.confirm(
      `Delete "${productName}"? This can't be undone.`,
    );
    if (!confirmed) return;

    startTransition(() => {
      deleteProduct(productId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-full p-2 text-text-muted transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label={`Delete ${productName}`}
    >
      <Trash2 size={16} />
    </button>
  );
}
