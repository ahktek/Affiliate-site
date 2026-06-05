import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Heuristic auto-assignment: scores each category by keyword hits in name/slug/description
 * against the provided text. Returns the best-matching category id or null.
 */
export async function autoAssignCategory(text: string): Promise<{
  primaryCategoryId: string | null;
  matches: Array<{ id: string; slug: string; name: string; score: number }>;
}> {
  const { data: cats, error } = await supabaseAdmin
    .from("categories")
    .select("id, slug, name, description");
  if (error) throw new Error(error.message);

  const haystack = text.toLowerCase();
  const matches = (cats ?? []).map((c) => {
    const tokens = [
      ...(c.name ?? "").toLowerCase().split(/\s+/),
      ...(c.slug ?? "").toLowerCase().split(/-+/),
      ...((c.description ?? "").toLowerCase().match(/[a-z][a-z0-9]{3,}/g) ?? []),
    ].filter((t) => t && t.length >= 3);
    const unique = Array.from(new Set(tokens));
    let score = 0;
    for (const t of unique) {
      const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "g");
      const hits = haystack.match(re);
      if (hits) score += hits.length;
    }
    return { id: c.id, slug: c.slug, name: c.name, score };
  });

  matches.sort((a, b) => b.score - a.score);
  const top = matches[0];
  return {
    primaryCategoryId: top && top.score > 0 ? top.id : null,
    matches: matches.slice(0, 5),
  };
}

/** Replace post_categories links for a post. */
export async function setPostCategories(postId: string, categoryIds: string[]) {
  await supabaseAdmin.from("post_categories").delete().eq("post_id", postId);
  if (categoryIds.length === 0) return;
  const rows = categoryIds.map((category_id) => ({ post_id: postId, category_id }));
  const { error } = await supabaseAdmin.from("post_categories").insert(rows);
  if (error) throw new Error(error.message);
}
