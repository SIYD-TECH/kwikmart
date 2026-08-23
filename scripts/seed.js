// scripts/seed.js
//
// Run this ONCE to fill an empty Supabase database with starting data.
// It reads kwikmart-seed-data.json, then for each product:
//   1. Builds a URL-safe slug from the name (handling duplicates)
//   2. Tries to find a real photo on Open Food Facts
//   3. Falls back to Pexels if Open Food Facts has nothing
//   4. Inserts the product into Supabase
//
// Usage:  node scripts/seed.js
//
// Requires these in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS — this script is trusted, one-time)
//   PEXELS_API_KEY

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// ── Helpers ─────────────────────────────────────────────

// Turns "Fresh Tomatoes (1kg)" into "fresh-tomatoes-1kg"
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // anything not a letter/number becomes a hyphen
    .replace(/(^-|-$)/g, ""); // trim leading/trailing hyphens
}

// Guarantees no two products end up with the same slug.
// "fresh-tomatoes" -> if taken, becomes "fresh-tomatoes-2", "fresh-tomatoes-3", etc.
function makeUniqueSlug(name, usedSlugs) {
  const base = slugify(name);
  let slug = base;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  usedSlugs.add(slug);
  return slug;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Try Open Food Facts first — free, no key needed, but weak on local
// Nigerian brands specifically.
async function findImageOnOpenFoodFacts(productName) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      productName,
    )}&search_simple=1&action=process&json=1&page_size=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const product = data?.products?.[0];
    return product?.image_url || null;
  } catch {
    return null;
  }
}

// Fallback: Pexels stock photo search. Won't be the exact branded product,
// but a real, relevant photo — used when Open Food Facts has nothing.
async function findImageOnPexels(query) {
  if (!PEXELS_API_KEY) return null;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query,
    )}&per_page=1`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.photos?.[0]?.src?.medium || null;
  } catch {
    return null;
  }
}

// (No more auto-generated search terms — each product now carries its own
// hand-picked `image_query` in the seed data, since letting the script guess
// generic terms from the product name produced too many mismatched photos.)

// ── Main ────────────────────────────────────────────────

async function seed() {
  const dataPath = path.join(__dirname, "kwikmart-seed-data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  const usedCategorySlugs = new Set();
  const usedProductSlugs = new Set();

  let offHits = 0;
  let pexelsHits = 0;
  let misses = [];

  // 1. Insert pickup location
  console.log("Inserting pickup location...");
  const { data: location, error: locationError } = await supabase
    .from("pickup_locations")
    .insert({
      name: data.pickup_location.name,
      address: data.pickup_location.address,
    })
    .select()
    .single();

  if (locationError) throw locationError;
  console.log(`✓ Pickup location created: ${location.name}`);

  // 2. Insert categories, keep a name -> id map for products to reference
  console.log(`Inserting ${data.categories.length} categories...`);
  const categoryIdByName = {};

  for (const categoryName of data.categories) {
    const slug = makeUniqueSlug(categoryName, usedCategorySlugs);
    const { data: category, error } = await supabase
      .from("categories")
      .insert({ name: categoryName, slug })
      .select()
      .single();

    if (error) throw error;
    categoryIdByName[categoryName] = category.id;
  }
  console.log("✓ Categories inserted");

  // 3. Insert products, one at a time (fetching images as we go)
  console.log(
    `Inserting ${data.products.length} products (this fetches images, so it takes a bit)...`,
  );

  for (const [index, product] of data.products.entries()) {
    const slug = makeUniqueSlug(product.name, usedProductSlugs);
    const categoryId = categoryIdByName[product.category];

    if (!categoryId) {
      console.warn(
        `⚠ Skipping "${product.name}" — unknown category "${product.category}"`,
      );
      continue;
    }

    // Try Open Food Facts first, then Pexels using the hand-picked query, then give up gracefully
    let imageUrl = await findImageOnOpenFoodFacts(product.name);
    if (imageUrl) {
      offHits++;
    } else {
      imageUrl = await findImageOnPexels(product.image_query || product.name);
      if (imageUrl) {
        pexelsHits++;
      } else {
        misses.push(product.name);
      }
    }

    const { error } = await supabase.from("products").insert({
      category_id: categoryId,
      name: product.name,
      slug,
      description: product.description || null, // left blank for most —
      // AI description generator (feature #2) fills these in later
      price: product.price,
      stock_quantity: 50, // reasonable demo default; adjust in admin panel later
      image_url: imageUrl,
    });

    if (error) throw error;

    console.log(
      `  [${index + 1}/${data.products.length}] ${product.name} ${imageUrl ? "✓" : "✗ no image"}`,
    );

    // Small delay so we're not hammering free APIs too fast
    await delay(250);
  }

  // ── Summary ───────────────────────────────────────────
  console.log("\n─── Seed complete ───");
  console.log(`Categories: ${data.categories.length}`);
  console.log(`Products: ${data.products.length}`);
  console.log(`  Images from Open Food Facts: ${offHits}`);
  console.log(`  Images from Pexels (fallback): ${pexelsHits}`);
  console.log(`  No image found: ${misses.length}`);
  if (misses.length > 0) {
    console.log(`  Missing images for: ${misses.join(", ")}`);
    console.log("  (These can be added manually later from the admin panel.)");
  }
}

seed()
  .then(() => {
    console.log("\nDone. Check your Supabase Table Editor to see the data.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\nSeed script failed:", err);
    process.exit(1);
  });
