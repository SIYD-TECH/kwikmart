"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Home, ShoppingBasket, PackageCheck } from "lucide-react";

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Stops the page behind the drawer from scrolling while it's open —
  // without this, scrolling the drawer's content can also scroll the
  // background page underneath it, which feels broken.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="p-2 text-primary"
      >
        <Menu size={22} />
      </button>

      {/* Dark backdrop — covers the whole screen, click it to close.
          Only rendered at all while open, so it never blocks clicks
          on the rest of the page when the menu is closed. */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* The sliding panel itself. Always rendered (not just when open) so
          the slide animation has something to animate FROM — if we only
          rendered it while open, it would just appear instantly with no
          slide-in motion. translate-x-full pushes it fully off-screen to
          the right when closed; translate-x-0 brings it fully on-screen. */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <span className="font-heading text-lg font-bold text-primary">
            Menu
          </span>
          <button
            onClick={close}
            aria-label="Close menu"
            className="p-1 text-text-muted"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="/"
            onClick={close}
            className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-text hover:bg-surface-muted"
          >
            <Home size={18} /> Home
          </Link>
          {/* <Link
            href="/shop"
            onClick={close}
            className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-text hover:bg-surface-muted"
          >
            <ShoppingBasket size={18} /> Shop
          </Link> */}
          <Link
            href="/track"
            onClick={close}
            className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-text hover:bg-surface-muted"
          >
            <PackageCheck size={18} /> Track Order
          </Link>
        </nav>
      </div>
    </div>
  );
}
