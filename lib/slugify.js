// lib/slugify.js
//
// Same slugify logic as the seed script, pulled into a shared file so the
// admin panel and seed script can't drift into generating slugs
// differently from each other.

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Checks the database itself for collisions — needed because two admin
// users (or an admin + the original seed data) could otherwise both try
// to create "Fresh Tomatoes" and collide on the same slug.
export async function makeUniqueSlug(supabase, name, { excludeId } = {}) {
  const base = slugify(name);
  let slug = base;
  let counter = 2;

  while (true) {
    let query = supabase.from("products").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();

    if (!data) return slug; // no collision, this slug is free
    slug = `${base}-${counter}`;
    counter++;
  }
}
