// lib/paystack.js
//
// Small wrapper around Paystack's API. Both functions run SERVER-SIDE only
// (they use PAYSTACK_SECRET_KEY, which must never reach the browser).

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Starts a payment session. Paystack gives back a URL — we send the
// customer's browser there to actually enter card details.
export async function initializeTransaction({
  email,
  amountInKobo,
  reference,
  callbackUrl,
}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo, // Paystack works in kobo (₦1 = 100 kobo), not naira
      reference,
      callback_url: callbackUrl,
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack initialization failed");
  }
  return data.data; // { authorization_url, access_code, reference }
}

// Checks with Paystack directly: did this specific payment actually
// succeed? We never trust the browser's word for this — always ask
// Paystack itself.
export async function verifyTransaction(reference) {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Paystack verification failed");
  }
  return data.data; // { status: 'success' | 'failed' | ..., amount, reference, ... }
}
