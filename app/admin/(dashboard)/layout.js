import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Store, Package, Receipt } from "lucide-react";
import { Toaster } from "sonner";
import LogoutButton from "./_components/LogoutButton";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen">
      {/* One <Toaster /> here is enough for the whole admin section —
          any page underneath can call toast.success(...) / toast.error(...)
          from anywhere, and it'll render here automatically. */}
      <Toaster richColors position="top-right" />

      <aside className="hidden w-64 shrink-0 flex-col bg-surface-muted p-4 lg:flex">
        <div className="mb-8 px-2">
          <div className="mb-1 flex items-center gap-2 font-heading text-lg font-bold text-primary">
            <Store size={22} /> KwikMart
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Admin Dashboard
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-text-muted transition hover:bg-surface"
          >
            <Package size={18} /> Inventory
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-text-muted transition hover:bg-surface"
          >
            <Receipt size={18} /> Orders
          </Link>
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-surface p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <p className="truncate text-sm font-semibold">{user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}
