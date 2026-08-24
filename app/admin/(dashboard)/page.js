import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, Receipt } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold text-primary">
        Welcome back
      </h1>
      <p className="text-sm text-text-muted">Signed in as {user?.email}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/inventory"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-6 transition hover:shadow-md"
        >
          <Package size={24} className="text-primary" />
          <div>
            <p className="font-heading font-bold">Inventory</p>
            <p className="text-sm text-text-muted">Manage products & stock</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-6 transition hover:shadow-md"
        >
          <Receipt size={24} className="text-primary" />
          <div>
            <p className="font-heading font-bold">Orders</p>
            <p className="text-sm text-text-muted">
              View & update the order queue
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
