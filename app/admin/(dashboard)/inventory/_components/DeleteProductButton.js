"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

export default function DeleteProductButton({ productId, productName }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Delete "${productName}"? This can't be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteProduct(productId);
        toast.success(`"${productName}" deleted`);
      } catch (err) {
        toast.error("Failed to delete product");
      }
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
