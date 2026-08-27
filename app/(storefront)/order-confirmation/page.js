// app/(storefront)/order-confirmation/page.js
//
// Paystack sends the customer back here after they pay (or cancel). The
// URL will have a ?reference=... or ?trxref=... on it — Paystack's way of
// saying "here's which payment this was."
//
// IMPORTANT: we do not just trust that showing up here means payment
// succeeded. Someone could type this URL by hand, or the payment could
// have failed. We always call Paystack directly to ask "did this specific
// reference actually succeed?" before marking anything as paid.

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import ClearCartOnSuccess from "../_components/ClearCartOnSuccess";
import { sendOrderConfirmationEmail } from "@/lib/email";

export default async function OrderConfirmationPage({ searchParams }) {
  const params = await searchParams;
  const reference = params?.reference || params?.trxref;

  if (!reference) {
    return (
      <ConfirmationMessage
        success={false}
        message="No payment reference found."
      />
    );
  }

  const supabase = createAdminClient();

  let verification;
  try {
    verification = await verifyTransaction(reference);
  } catch (err) {
    return (
      <ConfirmationMessage
        success={false}
        message="We couldn't verify this payment with Paystack. If you were charged, contact support with your order number."
      />
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", reference)
    .single();

  if (!order) {
    return <ConfirmationMessage success={false} message="Order not found." />;
  }

  if (verification.status !== "success") {
    return (
      <ConfirmationMessage
        success={false}
        orderNumber={order.order_number}
        message="Payment was not completed. You can try again from your cart."
      />
    );
  }

  // IDEMPOTENCY GUARD: this page can run more than once for the same order
  // — e.g. the customer refreshes this page, or clicks Paystack's "back to
  // site" link twice. Without this check, we'd insert a second 'paid'
  // status row and decrement stock a second time for the same order.
  // We only do the "mark as paid + reduce stock" work the FIRST time.
  const alreadyPaid = order.current_status !== "pending";

  if (!alreadyPaid) {
    // Record the status change — the schema's trigger automatically
    // updates orders.current_status to match whatever we insert here.
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "paid",
    });

    // Reduce stock for each item, now that payment is genuinely confirmed
    // (the decision we made back when designing the schema: stock only
    // moves on CONFIRMED payment, never just on "order placed").
    for (const item of order.order_items) {
      await supabase.rpc("decrement_stock", {
        product_id_input: item.product_id,
        quantity_input: item.quantity,
      });
    }
  }

 try {
      await sendOrderConfirmationEmail(order);
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }
  
    return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <ClearCartOnSuccess />
      <CheckCircle2 size={56} className="mx-auto text-primary" />
      <h1 className="mt-4 font-heading text-2xl font-bold">
        Thank you for your order!
      </h1>
      <p className="mt-2 text-text-muted">
        Your payment was successful. We'll have it ready for pickup shortly.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-left">
        <p className="text-sm text-text-muted">Order Number</p>
        <p className="font-heading text-2xl font-bold text-primary">
          {order.order_number}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/track?order=${order.order_number}`}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
        >
          Track My Order
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-border px-6 py-3 font-semibold transition hover:bg-surface-muted"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function ConfirmationMessage({ success, message, orderNumber }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {success ? (
        <CheckCircle2 size={56} className="mx-auto text-primary" />
      ) : (
        <XCircle size={56} className="mx-auto text-red-500" />
      )}
      <h1 className="mt-4 font-heading text-xl font-bold">
        {success ? "Payment Confirmed" : "Payment Not Completed"}
      </h1>
      <p className="mt-2 text-text-muted">{message}</p>
      {orderNumber && (
        <p className="mt-2 text-sm text-text-muted">Order: {orderNumber}</p>
      )}
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
      >
        Back to Cart
      </Link>
    </div>
  );
}
