"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { getNextStatus, STATUS_LABELS } from "@/lib/orderStatus";

// Notice this takes ONLY orderId now — no status argument from the
// client. Instead of trusting whatever the browser says the next status
// should be, we look up the order's REAL current status ourselves and
// compute the correct next step server-side. This is the same principle
// as never trusting a client-submitted price during checkout: the client
// can suggest what it expects, but the server is the one source of truth
// that actually decides.
export async function advanceOrderStatus(orderId) {
  const supabase = createAdminClient();

  // Need more than just current_status now — order_number and customer
  // info are required to actually send the update email below.
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("current_status, order_number, customer_name, customer_email")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) throw new Error("Order not found");

  const nextStatus = getNextStatus(order.current_status);
  if (!nextStatus) {
    throw new Error(
      `Cannot advance order from status: ${order.current_status}`,
    );
  }

  const { error } = await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: nextStatus,
  });

  if (error) throw new Error("Failed to update order status: " + error.message);

  revalidatePath("/admin/orders");

  // Email failure must never break the actual status update — the admin's
  // action already succeeded by this point regardless of what happens next.
  try {
    await sendOrderStatusUpdateEmail(order, STATUS_LABELS[nextStatus]);
  } catch (err) {
    console.error("Failed to send status update email:", err);
  }

  return { newStatus: nextStatus };
}

export async function cancelOrder(orderId) {
  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("order_number, customer_name, customer_email")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) throw new Error("Order not found");

  const { error } = await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: "cancelled",
  });

  if (error) throw new Error("Failed to cancel order: " + error.message);

  revalidatePath("/admin/orders");

  try {
    await sendOrderStatusUpdateEmail(order, STATUS_LABELS.cancelled);
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
  }
}
