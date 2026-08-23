"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShoppingBag, Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/Cartcontext";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag size={48} className="text-text-muted" />
        <h1 className="font-heading text-xl font-bold">Your cart is empty</h1>
        <p className="text-text-muted">
          Add something to your cart before checking out.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-light"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+ ]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email, or leave this blank";
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Send the browser to Paystack's real payment page. We don't clear
      // the cart or mark the order paid here — that only happens after
      // Paystack confirms the payment actually succeeded, on the
      // order-confirmation page.
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setSubmitError(
        "Could not reach the server. Check your connection and try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 font-heading text-2xl font-bold text-primary">
        Secure Checkout
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Almost there — review your details below.
      </p>

      <div className="flex flex-col gap-8 lg:flex-row">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
          {/* Contact Details */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-heading font-bold">Contact Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Chinedu"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2 outline-none focus:border-primary"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Okafor"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2 outline-none focus:border-primary"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Email{" "}
                  <span className="font-normal text-text-muted">
                    (optional)
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="chinedu@example.com"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2 outline-none focus:border-primary"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. 08012345678"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2 outline-none focus:border-primary"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          {/* Pickup — informational only, since it's the only option */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-heading font-bold">Pickup Location</h2>
            <div className="flex items-start gap-2 rounded-xl bg-surface-muted p-4 text-sm">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">KwikMart Pickup — Ikeja</p>
                <p className="text-text-muted">
                  14 Allen Avenue, Ikeja, Lagos, Nigeria
                </p>
                <p className="mt-1 text-text-muted">
                  Free — ready shortly after payment
                </p>
              </div>
            </div>
          </section>

          {/* Payment — informational only, since Paystack is the only method */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-heading font-bold">Payment Method</h2>
            <div className="flex items-center gap-4 rounded-xl border-2 border-primary bg-primary/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                P
              </div>
              <div>
                <p className="font-semibold">Paystack</p>
                <p className="text-sm text-text-muted">
                  Card, Bank Transfer, USSD
                </p>
              </div>
            </div>
          </section>

          {submitError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white transition hover:bg-primary-light disabled:opacity-60"
          >
            <Lock size={18} />
            {isSubmitting ? "Redirecting to Paystack..." : "Place Order"}
          </button>
          <p className="flex items-center justify-center gap-1 text-center text-xs text-text-muted">
            <ShieldCheck size={14} /> Secure payment powered by Paystack
          </p>
        </form>

        {/* Order review */}
        <aside className="w-full shrink-0 lg:w-96">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">
              Order Summary
            </h2>
            <div className="flex max-h-96 flex-col gap-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Qty {item.quantity}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-primary">
                      ₦{Number(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4 font-heading text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                ₦{Number(subtotal).toLocaleString()}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
