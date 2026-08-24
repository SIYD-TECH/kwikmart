"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, ArrowRight, ShoppingBasket } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Incorrect email or password.");
      setIsSubmitting(false);
      return;
    }

    // router.refresh() forces server-rendered parts of the app to
    // re-check auth state immediately, rather than showing stale
    // "logged out" content for a moment after a successful login.
    router.refresh();
    router.push("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center gap-2 font-heading text-2xl font-bold text-primary">
            <ShoppingBasket size={28} /> KwikMart
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Community focused, locally sourced.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="font-heading text-xl font-bold">Admin Portal</h1>
            <p className="mt-1 text-sm text-text-muted">
              Sign in to manage the market.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kwikmart.com"
                  className="w-full rounded-xl border-2 border-border py-3 pl-10 pr-3 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border-2 border-border py-3 pl-10 pr-3 outline-none focus:border-primary"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white transition hover:bg-primary-light disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Login to Dashboard"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
