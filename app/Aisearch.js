// lib/aiSearch.js

import { createClient } from "@/lib/supabase/server";
import { askGemini } from "@/lib/gemini";

export async function performAiSearch(query) {
  const supabase = await createClient();

  // At 100 products, sending the whole catalog to Gemini in one prompt is
  // genuinely simpler than building a vector-search pipeline — and still
  // fast enough for a demo. This wouldn't scale to a 10,000-product
  // catalog, but that's a real "when we outgrow this" problem, not one
  // worth solving now.
  const { data: products } = await supabase
    .from("products")
    .select("id, name, categories(name)");

  const productList = products
    .map((p) => `${p.id}: ${p.name} (${p.categories?.name})`)
    .join("\n");

  const prompt = `You are a search assistant for KwikMart, a Nigerian grocery store.
Given a customer's search query and the list of available products below, return
ONLY a JSON array of product IDs that genuinely match the customer's intent,
ordered from most to least relevant. If nothing matches, return an empty array.
Do not include any explanation or markdown — just the raw JSON array.

Customer query: "${query}"

Products:
${productList}`;

  try {
    const rawResponse = await askGemini(prompt);

    // Gemini sometimes wraps its answer in a ```json ... ``` code block
    // even when explicitly told not to — strip that off before parsing,
    // so a stray formatting habit doesn't break JSON.parse().
    const cleaned = rawResponse.replace(/```json|```/g, "").trim();
    const matchedIds = JSON.parse(cleaned);

    if (!Array.isArray(matchedIds) || matchedIds.length === 0) return [];

    const { data: matchedProducts } = await supabase
      .from("products")
      .select("id, name, slug, price, image_url, stock_quantity")
      .in("id", matchedIds);

    // Supabase doesn't guarantee results come back in the order we asked
    // for — but Gemini's ordering (most to least relevant) is exactly the
    // order we want to show results in. This re-sorts the DB results to
    // match Gemini's original ranking.
    return matchedIds
      .map((id) => matchedProducts.find((p) => p.id === id))
      .filter(Boolean);
  } catch (err) {
    console.error("AI search failed, falling back to keyword search:", err);
    // If Gemini errors out (bad key, quota, network blip), don't show a
    // broken page — fall back to a plain keyword search instead. A worse
    // search result is far better than no result at all.
    const { data: fallbackProducts } = await supabase
      .from("products")
      .select("id, name, slug, price, image_url, stock_quantity")
      .ilike("name", `%${query}%`);
    return fallbackProducts || [];
  }
}
