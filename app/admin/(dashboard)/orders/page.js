import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import OrderActions from "./_components/OrderActions";
import { getNextStatus } from "@/lib/orderStatus";

const PAGE_SIZE = 15;

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-600",
  paid: "bg-blue-100 text-blue-700",
  preparing: "bg-amber-100 text-amber-700",
  ready_for_pickup: "bg-primary/10 text-primary",
  picked_up: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  paid: "Paid",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  picked_up: "Picked Up",
  cancelled: "Cancelled",
};

export default async function OrdersPage({ searchParams }) {
  const params = await searchParams;
  const statusFilter = params?.status || "";
  const page = Math.max(1, parseInt(params?.page) || 1);

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total_amount, current_status, created_at",
      {
        count: "exact",
      },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (statusFilter) query = query.eq("current_status", statusFilter);

  const { data: orders, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <h1 className="mb-1 font-heading text-2xl font-bold">Order Queue</h1>
      <p className="mb-6 text-sm text-text-muted">
        View incoming orders and update their status.
      </p>

      {/* Status filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill href="/admin/orders" active={!statusFilter} label="All" />
        {Object.keys(STATUS_LABELS).map((status) => (
          <FilterPill
            key={status}
            href={`/admin/orders?status=${status}`}
            active={statusFilter === status}
            label={STATUS_LABELS[status]}
          />
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs font-semibold uppercase text-text-muted">
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders?.map((order) => {
              const nextStatus = getNextStatus(order.current_status);
              const canCancel = ["pending", "paid"].includes(
                order.current_status,
              );

              return (
                <tr key={order.id} className="hover:bg-surface-muted">
                  <td className="px-6 py-3">
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-xs text-text-muted">
                      {order.customer_phone}
                    </p>
                  </td>
                  <td className="px-6 py-3 font-semibold">
                    ₦{Number(order.total_amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.current_status]}`}
                    >
                      {STATUS_LABELS[order.current_status]}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {order.current_status === "pending" ? (
                      <p className="text-right text-xs text-text-muted">
                        Awaiting payment
                      </p>
                    ) : order.current_status === "picked_up" ||
                      order.current_status === "cancelled" ? (
                      <p className="text-right text-xs text-text-muted">
                        No further action
                      </p>
                    ) : (
                      <OrderActions
                        orderId={order.id}
                        nextStatus={nextStatus}
                        canCancel={canCancel}
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {orders?.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-text-muted"
                >
                  No orders match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between px-2 text-sm text-text-muted">
        <span>
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, count || 0)} of {count || 0}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${statusFilter ? `&status=${statusFilter}` : ""}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border hover:bg-surface-muted"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ href, active, label }) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition ${
        active
          ? "bg-primary text-white"
          : "bg-surface-muted text-text-muted hover:bg-border"
      }`}
    >
      {label}
    </Link>
  );
}
