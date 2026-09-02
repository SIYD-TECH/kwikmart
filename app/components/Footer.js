import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MapPin, ShoppingBasket, Receipt, LayoutGrid } from "lucide-react";
import Image from "next/image";

// Async because it fetches a few real categories to link to — same
// principle as the rest of the site: every link here goes somewhere
// real, nothing fabricated or dead-ended.
export default async function Footer() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name")
    .limit(5);

  return (
    <footer className="mt-16 border-t bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex gap-2">
              <Image
                src="/icon.png"
                alt="KwikMart logo"
                width={30}
                height={24}
              />
              <p className="font-heading text-lg font-bold text-primary">
                KwikMart
              </p>
            </div>

            <p className="mt-2 text-sm text-text-muted">
              Community-focused, locally sourced groceries Lagos, Nigeria.
            </p>
          </div>

          {/* Quick links — all real, existing pages */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Shop
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-text-muted hover:text-primary"
                >
                  <ShoppingBasket size={14} /> Browse Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 text-text-muted hover:text-primary"
                >
                  <Receipt size={14} /> Your Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="flex items-center gap-2 text-text-muted hover:text-primary"
                >
                  <LayoutGrid size={14} /> Track an Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Real categories, pulled live from the database */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Shop by Category
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {categories?.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/?category=${category.slug}`}
                    className="text-text-muted hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/"
                  className="font-semibold text-primary hover:underline"
                >
                  View all categories →
                </Link>
              </li>
            </ul>
          </div>

          {/* About this project — honest, not a real business */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              About
            </p>
            <p className="text-sm text-text-muted">
              KwikMart is a demo e-commerce build real checkout, real admin
              tools, no real business behind it.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} KwikMart
        </div>
      </div>
    </footer>
  );
}
