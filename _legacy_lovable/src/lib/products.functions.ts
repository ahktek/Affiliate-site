import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PRODUCT_LIST_FIELDS =
  "id, slug, name, vendor, logo_url, short_description, pricing_model, starting_price, currency, rating, featured, primary_category_id";

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        featured: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
        categorySlug: z.string().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let categoryId: string | null = null;
    if (data.categorySlug) {
      const { data: cat } = await supabaseAdmin
        .from("categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      categoryId = cat?.id ?? null;
    }

    let q = supabaseAdmin
      .from("products")
      .select(PRODUCT_LIST_FIELDS)
      .order("rating", { ascending: false, nullsFirst: false })
      .order("name", { ascending: true })
      .limit(data.limit ?? 60);
    if (data.featured) q = q.eq("featured", true);
    if (categoryId) q = q.eq("primary_category_id", categoryId);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { products: rows ?? [] };
  });

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name, vendor, logo_url, website_url, affiliate_url, short_description, long_description, pricing_model, starting_price, currency, rating, pros, cons, best_for, primary_category_id",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { product };
  });

export const listProductSlugsForSitemap = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.from("products").select("slug, updated_at");
  if (error) throw new Error(error.message);
  return { products: data ?? [] };
});

export const getProductReview = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name, vendor, logo_url, website_url, affiliate_url, short_description, long_description, pricing_model, starting_price, currency, rating, pros, cons, best_for, primary_category_id",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return { product: null, related: [], category: null };

    const [{ data: related }, { data: category }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select(PRODUCT_LIST_FIELDS)
        .neq("id", product.id)
        .eq("primary_category_id", product.primary_category_id ?? "00000000-0000-0000-0000-000000000000")
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(4),
      product.primary_category_id
        ? supabaseAdmin
            .from("categories")
            .select("id, slug, name")
            .eq("id", product.primary_category_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    return { product, related: related ?? [], category: category ?? null };
  });
