"use server";

import { askGemini } from "@/lib/gemini";

export async function generateProductDescription(productName, categoryName) {
  if (!productName?.trim()) {
    return { error: "Enter a product name first" };
  }

  // Deliberately instructing the model not to invent specific unfounded
  // claims — same principle we applied by hand throughout the storefront
  // (declining fabricated "farm-sourced" style claims in earlier designs).
  // No point avoiding that manually in the UI if the AI quietly
  // reintroduces it in generated text.
  const prompt = `Write a short, appetizing product description (1-2 sentences,
under 40 words) for a grocery store listing. Be honest and factual — do not
invent specific claims like "farm-sourced," "organic," or health claims
unless obviously implied by the product name itself. Product: "${productName}"${
    categoryName ? `, Category: ${categoryName}` : ""
  }.
Return ONLY the description text — no quotes, no markdown, no explanation.`;

  try {
    const text = await askGemini(prompt);
    return { description: text.trim() };
  } catch (err) {
    return { error: "Failed to generate description. Try again." };
  }
}
