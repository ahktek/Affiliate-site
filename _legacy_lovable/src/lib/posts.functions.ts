import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const POST_LIST_FIELDS =
  "id, slug, type, title, excerpt, cover_image_url, published_at, reading_minutes, featured, primary_category_id";

export const listPublishedPosts = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        type: z.enum(["article", "review", "comparison", "guide"]).optional(),
        limit: z.number().int().min(1).max(50).optional(),
        featured: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("posts")
      .select(POST_LIST_FIELDS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 24);
    if (data.type) q = q.eq("type", data.type);
    if (data.featured) q = q.eq("featured", true);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { posts: rows ?? [] };
  });

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        "id, slug, type, title, excerpt, content, cover_image_url, author_id, published_at, updated_at, reading_minutes, seo_title, seo_description, og_image_url, primary_category_id",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return { post: null, author: null, categories: [], related: [] };

    const [{ data: author }, { data: pcs }, related] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("display_name, avatar_url, bio, website, twitter")
        .eq("id", post.author_id)
        .maybeSingle(),
      supabaseAdmin
        .from("post_categories")
        .select("category_id, categories(id, slug, name)")
        .eq("post_id", post.id),
      relatedFor(post.id, post.primary_category_id, post.type as PostType),
    ]);

    const categories = (pcs ?? [])
      .map((r: any) => r.categories)
      .filter((c: any) => c && c.slug);

    return { post, author, categories, related };
  });

type PostType = "article" | "review" | "comparison" | "guide";

async function relatedFor(
  postId: string,
  primaryCategoryId: string | null,
  type: PostType,
) {
  // Prefer same primary category; fall back to same type; then most recent.
  const base = supabaseAdmin
    .from("posts")
    .select(
      "id, slug, type, title, excerpt, cover_image_url, published_at, reading_minutes",
    )
    .eq("status", "published")
    .neq("id", postId)
    .order("published_at", { ascending: false })
    .limit(3);

  if (primaryCategoryId) {
    const { data } = await base.eq("primary_category_id", primaryCategoryId);
    if (data && data.length >= 3) return data;
    const need = 3 - (data?.length ?? 0);
    const { data: more } = await supabaseAdmin
      .from("posts")
      .select(
        "id, slug, type, title, excerpt, cover_image_url, published_at, reading_minutes",
      )
      .eq("status", "published")
      .neq("id", postId)
      .eq("type", type)
      .order("published_at", { ascending: false })
      .limit(need + 3);
    const seen = new Set((data ?? []).map((p) => p.id));
    const merged = [
      ...(data ?? []),
      ...((more ?? []).filter((p) => !seen.has(p.id))),
    ].slice(0, 3);
    return merged;
  }

  const { data } = await base.eq("type", type);
  return data ?? [];
}

export const listPostSlugsForSitemap = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("slug, type, published_at")
    .eq("status", "published");
  if (error) throw new Error(error.message);
  return { posts: data ?? [] };
});

const COMPARE_PRODUCT_FIELDS =
  "id, slug, name, vendor, logo_url, website_url, affiliate_url, short_description, pricing_model, starting_price, currency, rating, pros, cons, best_for";

export const getComparisonBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(
        "id, slug, title, excerpt, content, cover_image_url, published_at, updated_at, reading_minutes, seo_title, seo_description, og_image_url",
      )
      .eq("slug", data.slug)
      .eq("type", "comparison")
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return { post: null, products: [], criteria: [], scores: [] };

    const [{ data: links }, { data: criteria }, { data: scores }] = await Promise.all([
      supabaseAdmin
        .from("post_products")
        .select(`position, product:products(${COMPARE_PRODUCT_FIELDS})`)
        .eq("post_id", post.id)
        .order("position", { ascending: true }),
      supabaseAdmin
        .from("comparison_criteria")
        .select("id, label, sort_order")
        .eq("post_id", post.id)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("comparison_scores")
        .select("criterion_id, product_id, score, note")
        .eq("post_id", post.id),
    ]);

    const products = (links ?? [])
      .map((l: any) => l.product)
      .filter(Boolean)
      .slice(0, 4);

    return {
      post,
      products,
      criteria: criteria ?? [],
      scores: scores ?? [],
    };
  });
