import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-surface-muted py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-text-muted md:flex-row">
        <div>
          <p className="font-heading font-semibold text-primary">KwikMart</p>
          <p>Community-focused, locally sourced groceries — Lagos, Nigeria.</p>
        </div>
        <Link
          href="/admin"
          className="flex items-center gap-1 hover:text-primary"
        >
          <MapPin size={14} /> Admin Login
        </Link>
      </div>
    </footer>
  );
}
