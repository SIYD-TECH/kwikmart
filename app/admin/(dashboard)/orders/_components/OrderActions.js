"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowRight, XCircle } from "lucide-react";
import { advanceOrderStatus, cancelOrder } from "../action";

const STATUS_LABELS = {
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  picked_up: "Picked Up",
};

// nextStatus is still passed in — but only to LABEL the button correctly
// ("Mark as Preparing"). The actual status change is decided server-side,
// in advanceOrderStatus, not by this value.
export default function OrderActions({ orderId, nextStatus, canCancel }) {
  const [isPending, startTransition] = useTransition();

  function handleAdvance() {
    startTransition(async () => {
      try {
        const result = await advanceOrderStatus(orderId);
        toast.success(`Order marked as ${STATUS_LABELS[result.newStatus]}`);
      } catch {
        toast.error("Failed to update order status");
      }
    });
  }

  function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this order? This cannot be undone.",
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await cancelOrder(orderId);
        toast.success("Order cancelled");
      } catch {
        toast.error("Failed to cancel order");
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      {nextStatus && (
        <button
          onClick={handleAdvance}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-light disabled:opacity-50"
        >
          Mark as {STATUS_LABELS[nextStatus]} <ArrowRight size={14} />
        </button>
      )}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <XCircle size={14} /> Cancel
        </button>
      )}
    </div>
  );
}
