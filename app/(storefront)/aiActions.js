"use server";

import { createClient } from "@/lib/supabase/server";
import { askGemini } from "@/lib/gemini";

// Fixed, hand-written facts about how KwikMart actually works. The
// assistant answers "how do I order" style questions from THIS text, not
// from its own guesses — so it can never invent a delivery option, a
// return policy, or a payment method we don't actually offer.
const HOW_IT_WORKS = `
- Browse products by category, or search using the search bar.
- Add items to your cart.
- At checkout, enter your name and phone number (email is optional).
- Pay securely via Paystack (card, bank transfer, or USSD).
- KwikMart is PICKUP ONLY — there is no delivery option currently.
- Pickup location: KwikMart Pickup, 14 Allen Avenue, Ikeja, Lagos, Nigeria.
- Track any order anytime at the "Track Order" page using your order number.
`;

export async function askKwikMartQuestion(question) {
  if (!question?.trim()) {
    return { error: "Type a question first" };
  }

  const supabase = await createClient();

  // Same principle as AI search and the order chat: give the model REAL,
  // freshly-fetched data to answer from, rather than letting it guess
  // whether something is in stock.
  const { data: products } = await supabase
    .from("products")
    .select("name, stock_quantity, categories(name)");

  const inventoryList = products
    .map((p) => {
      const status =
        p.stock_quantity === 0
          ? "Out of stock"
          : p.stock_quantity <= 10
            ? "Low stock"
            : "In stock";
      return `${p.name} (${p.categories?.name}) — ${status}`;
    })
    .join("\n");

  const prompt = `You are "Ask KwikMart," a friendly shopping assistant for
KwikMart, a Nigerian grocery pickup store. You can help with TWO kinds of
questions only:
1. Whether a product is available / in stock — using the real inventory
   list below.
2. How ordering/pickup works at KwikMart — using the facts below.

For anything else (unrelated topics, policies not listed below, requests
for information you don't have), politely say you don't have that
information and suggest contacting support. Do not invent anything not
provided below. Keep answers short and friendly — 2-3 sentences at most.

How KwikMart works:
${HOW_IT_WORKS}

Current inventory:
${inventoryList}

Customer's question: "${question}"`;

  try {
    const answer = await askGemini(prompt);
    return { answer: answer.trim() };
  } catch (err) {
    return {
      error: "Couldn't get an answer right now. Please try again shortly.",
    };
  }
}
