import Link from "next/link";
import { Search } from "lucide-react";
import MobileNavMenu from "./MobileNavMenu";
import CartLink from "./cart-components/CartLink";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="font-heading text-2xl font-bold text-primary flex gap-2">
          <Image src="/icon.png" alt="KwikMart logo" width={30} height={24} />
          KwikMart
        </Link>

        <form
          action="/search"
          className="hidden flex-1 max-w-md items-center gap-2 rounded-full border-2 border-border bg-surface-muted px-4 py-2 md:flex"
        >
          <Search size={18} className="text-text-muted" />
          <input
            type="text"
            name="q"
            placeholder="Search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
        </form>

        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <Link href="/shop" className="text-primary">
            Shop
          </Link>
          <Link href="/track" className="text-text-muted hover:text-primary">
            Track Order
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <CartLink />
          <MobileNavMenu />
        </div>
      </div>
    </header>
  );
}
