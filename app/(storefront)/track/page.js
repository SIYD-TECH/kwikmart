import { createClient } from "@/lib/supabase/server";
import { Search, MapPin, PackageCheck, CircleCheck } from "lucide-react";

// Customer-facing steps. We deliberately skip "pending" (pre-payment) here
// — nobody realistically tracks an order they haven't paid for yet.
const STEPS = [
  { status: "paid", label: "Order Placed" },
  { status: "preparing", label: "Being Prepared" },
  { status: "ready_for_pickup", label: "Ready for Pickup" },
  { status: "picked_up", label: "Picked Up" },
];

// Handles the order number regardless of how it arrives: typed as just
// digits ("1004"), pasted with the prefix ("KM-1004" or "km-1004"), or
// coming from a link elsewhere in the app that already includes it.
function normalizeOrderNumber(raw) {
  if (!raw) return null;
  const trimmed = raw.trim().toUpperCase();
  return trimmed.startsWith("KM-") ? trimmed : `KM-${trimmed}`;
}

export default async function TrackOrderPage({ searchParams }) {
  const params = await searchParams;
  const rawInput = params?.order?.trim();
  const orderNumber = normalizeOrderNumber(rawInput);
  // For the input box, show just the digits — "KM-" is displayed as a
  // fixed label beside it, not typed by the user.
  const digitsOnly = rawInput ? rawInput.toUpperCase().replace(/^KM-/, "") : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-2 font-heading text-2xl font-bold text-primary">
        Track Your Order
      </h1>
      <p className="mb-6 text-text-muted">
        Enter your order number to see its current status.
      </p>

      {/* Plain HTML form — submitting it just navigates to /track?order=...,
          no client-side JavaScript needed for something this simple. */}
      <form action="/track" className="mb-8 flex gap-2">
        <div className="flex flex-1 items-center rounded-xl border border-border bg-surface focus-within:border-primary">
          <span className="pl-4 font-semibold text-text-muted">KM-</span>
          <input
            type="text"
            name="order"
            defaultValue={digitsOnly}
            placeholder="1004"
            className="w-full bg-transparent px-2 py-3 outline-none"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-light"
        >
          <Search size={18} /> Track
        </button>
      </form>

      {orderNumber && <OrderResult orderNumber={orderNumber} />}
    </div>
  );
}

async function OrderResult({ orderNumber }) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "*, order_items(*), order_status_history(status, created_at), pickup_locations(name, address)",
    )
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return (
      <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        No order found with number "{orderNumber}". Double-check and try again.
      </p>
    );
  }

  if (order.current_status === "pending") {
    return (
      <p className="rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
        This order is still awaiting payment confirmation. Check back shortly,
        or contact support if you believe this is a mistake.
      </p>
    );
  }

  if (order.current_status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-heading font-bold text-red-600">
          This order was cancelled
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Order {order.order_number}
        </p>
      </div>
    );
  }

  // Find the timestamp for each step, if it's happened yet — this comes
  // straight from order_status_history, the audit trail we built into the
  // schema specifically so a page like this could show real timestamps.
  const timestampFor = (status) =>
    order.order_status_history.find((h) => h.status === status)?.created_at;

  const currentStepIndex = STEPS.findIndex(
    (s) => s.status === order.current_status,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-text-muted">Order Number</p>
        <p className="font-heading text-xl font-bold">{order.order_number}</p>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="relative flex justify-between">
          {/* One continuous line behind all the circles... */}
          <div className="absolute left-5 right-5 top-5 h-0.5 bg-border" />
          {/* ...with a colored line on top showing progress, sized by
              how many steps are complete out of the total. */}
          <div
            className="absolute left-5 top-5 h-0.5 bg-primary transition-all"
            style={{
              width:
                currentStepIndex <= 0
                  ? "0%"
                  : `calc(${(currentStepIndex / (STEPS.length - 1)) * 100}% - ${
                      (currentStepIndex / (STEPS.length - 1)) * 40
                    }px)`,
            }}
          />

          {STEPS.map((step, index) => {
            const isComplete = index <= currentStepIndex;
            const timestamp = timestampFor(step.status);
            return (
              <div
                key={step.status}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isComplete
                      ? "bg-primary text-white"
                      : "border-2 border-border bg-surface text-text-muted"
                  }`}
                >
                  {isComplete ? (
                    <CircleCheck size={20} />
                  ) : (
                    <PackageCheck size={18} />
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-semibold ${isComplete ? "text-primary" : "text-text-muted"}`}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <p className="text-[11px] text-text-muted">
                    {new Date(timestamp).toLocaleString("en-NG", {
                      hour: "numeric",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Items + pickup info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-heading font-bold">Items</h3>
          <ul className="flex flex-col gap-2">
            {order.order_items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.product_name_at_purchase}</span>
                <span className="text-text-muted">× {item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span className="text-primary">
              ₦{Number(order.total_amount).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-heading font-bold">Pickup Location</h3>
          <div className="flex items-start gap-2 text-sm">
            <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">{order.pickup_locations?.name}</p>
              <p className="text-text-muted">
                {order.pickup_locations?.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
