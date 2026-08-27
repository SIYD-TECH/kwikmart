"use client";

// Still the same Next.js mechanism as before (auto-shown while
// search/page.js does its async work) — just with a livelier animation
// this time. Needs 'use client' now because it cycles through captions
// using a timer, which only works in the browser.

import { useEffect, useState } from "react";
import { ShoppingBasket } from "lucide-react";

const CAPTIONS = [
  "Sniffing out the freshest matches...",
  "Asking our shopping assistant...",
  "Checking every aisle for you...",
  "Comparing notes with the grocery oracle...",
];

export default function SearchLoading() {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % CAPTIONS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <ShoppingBasket
        size={40}
        className="mx-auto animate-bounce text-primary"
      />
      <p className="mt-4 min-h-[1.5em] font-heading font-semibold text-primary transition-opacity">
        {CAPTIONS[captionIndex]}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-2xl bg-surface-muted"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
