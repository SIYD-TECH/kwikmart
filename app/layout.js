import "./globals.css";
import Link from "next/link";
import { Montserrat, Quicksand } from "next/font/google";
import { Search, ShoppingCart, MapPin } from "lucide-react";

// Next.js loads and self-hosts these fonts at build time — faster and more
// reliable than pulling them from Google's servers via a CSS @import.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-quicksand",
});

export const metadata = {
  title: "KwikMart",
  description: "Fresh groceries, delivered to your pickup point.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${quicksand.variable}`}>
      <body className="min-h-screen font-body">
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-4">
            <Link
              href="/"
              className="font-heading text-2xl font-bold text-primary"
            >
              KwikMart
            </Link>

            <div className="hidden flex-1 max-w-md items-center gap-2 rounded-full border-2 border-border bg-surface-muted px-4 py-2 md:flex">
              <Search size={18} className="text-text-muted" />
              <input
                type="text"
                placeholder="Search KwikMart..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
              />
            </div>

            <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
              <Link href="/" className="text-primary">
                Shop
              </Link>
              <Link
                href="/track"
                className="text-text-muted hover:text-primary"
              >
                Track Order
              </Link>
            </nav>

            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              <ShoppingCart size={18} />
              <span className="hidden md:inline">Cart</span>
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-16 border-t bg-surface-muted py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-text-muted md:flex-row">
            <div>
              <p className="font-heading font-semibold text-primary">
                KwikMart
              </p>
              <p>
                Community-focused, locally sourced groceries — Lagos, Nigeria.
              </p>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-1 hover:text-primary"
            >
              <MapPin size={14} /> Admin Login
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
