"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  LayoutGrid, 
  Sprout, 
  Wheat, 
  Soup, 
  Beef 
} from "lucide-react";

// Define icons inside the client component
const categoryIcons = {
  "Fresh Produce": Sprout,
  "Grains & Staples": Wheat,
  "Seasoning & Spices": Soup,
  "Frozen & Meat/Fish": Beef,
};

export default function CategoryFilter({
  categories = [],
  activeCategorySlug,
}) {
  const scrollContainerRef = useRef(null);
  const activeItemRef = useRef(null);

  // Auto-scroll the active pill into view whenever the category changes
  useEffect(() => {
    if (activeItemRef.current && scrollContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCategorySlug]);

  const activeCategoryObj = categories?.find((c) => c.slug === activeCategorySlug);
  const activeLabel = activeCategoryObj ? activeCategoryObj.name : "All Products";

  return (
    <>
      {/* Mobile Bar */}
      <div className="sticky top-16 z-30 mb-4 flex items-center bg-background/95 py-2 backdrop-blur-md md:hidden border-b border-border/50">
        <div className="flex shrink-0 items-center gap-1.5 border-r border-border pr-3 pl-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="max-w-[85px] truncate text-[11px] font-bold text-primary">
            {activeLabel}
          </span>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex flex-1 items-center gap-2 overflow-x-auto px-3 no-scrollbar"
        >
          <Link
            ref={!activeCategorySlug ? activeItemRef : null}
            href="/"
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              !activeCategorySlug
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-surface text-text-muted active:scale-95"
            }`}
          >
            <LayoutGrid size={13} />
            <span>All</span>
          </Link>

          {categories?.map((category) => {
            const Icon = categoryIcons[category.name] || Sprout;
            const isActive = activeCategorySlug === category.slug;

            return (
              <Link
                key={category.id}
                ref={isActive ? activeItemRef : null}
                href={`/?category=${category.slug}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-surface text-text-muted active:scale-95"
                }`}
              >
                <Icon size={13} />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 self-start sticky top-24 h-fit rounded-2xl bg-surface p-4 shadow-sm border border-border">
        <h2 className="mb-3 font-heading text-base font-bold text-primary">
          Categories
        </h2>
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              !activeCategorySlug
                ? "bg-secondary-light/30 text-secondary"
                : "text-text-muted hover:bg-surface-muted"
            }`}
          >
            <LayoutGrid size={18} /> All Categories
          </Link>

          {categories?.map((category) => {
            const Icon = categoryIcons[category.name] || Sprout;
            const isActive = activeCategorySlug === category.slug;

            return (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-secondary-light/30 text-secondary"
                    : "text-text-muted hover:bg-surface-muted"
                }`}
              >
                <Icon size={18} /> {category.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}