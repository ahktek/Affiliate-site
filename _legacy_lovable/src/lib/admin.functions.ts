import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdminOrEditor } from "@/lib/admin-auth";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* -------------------- session / role -------------------- */

export const getMyAdminContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as string);
    return {
      userId,
      email: (claims as any)?.email ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      isEditor: roles.includes("editor"),
      hasAccess: roles.includes("admin") || roles.includes("editor"),
    };
  });

/**
 * Grants the current signed-in user the `admin` role if and only if no admin
 * exists yet. Use this to bootstrap the very first administrator.
 */
export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) {
      return { ok: false as const, reason: "admin_exists" };
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* -------------------- dashboard -------------------- */

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .handler(async () => {
    const [posts, published, products, subs, cats] = await Promise.all([
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
    ]);
    return {
      posts: posts.count ?? 0,
      published: published.count ?? 0,
      drafts: (posts.count ?? 0) - (published.count ?? 0),
      products: products.count ?? 0,
      subscribers: subs.count ?? 0,
      categories: cats.count ?? 0,
    };
  });

/* -------------------- posts -------------------- */

const PostInput = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  type: z.enum(["article", "review", "comparison", "guide"]),
  title: z.string().min(1).max(255),
  excerpt: z.string().max(1000).optional().nullable(),
  content: z.any().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal("")),
  primary_category_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduled_at: z.string().datetime().optional().nullable(),
  published_at: z.string().datetime().optional().nullable(),
  reading_minutes: z.number().int().min(1).max(120).optional().nullable(),
  seo_title: z.string().max(255).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
  og_image_url: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().optional(),
});

export const listAdminPosts = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("id, slug, type, title, status, featured, published_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { posts: data ?? [] };
  });

export const getAdminPost = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { post };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => PostInput.parse(i))
  .handler(async ({ data, context }) => {
    const payload: any = { ...data, author_id: context.userId };
    if (payload.cover_image_url === "") payload.cover_image_url = null;
    if (payload.og_image_url === "") payload.og_image_url = null;
    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }
    const { data: row, error } = await supabaseAdmin
      .from("posts")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid(), patch: PostInput.partial() }).parse(i),
  )
  .handler(async ({ data }) => {
    const patch: any = { ...data.patch };
    if (patch.cover_image_url === "") patch.cover_image_url = null;
    if (patch.og_image_url === "") patch.og_image_url = null;
    if (patch.status === "published" && !patch.published_at) {
      patch.published_at = new Date().toISOString();
    }
    const { error } = await supabaseAdmin.from("posts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- products -------------------- */

const ProductInput = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(255),
  vendor: z.string().max(255).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  website_url: z.string().url().optional().nullable().or(z.literal("")),
  affiliate_url: z.string().url().optional().nullable().or(z.literal("")),
  short_description: z.string().max(500).optional().nullable(),
  pricing_model: z.string().max(50).optional().nullable(),
  starting_price: z.number().min(0).optional().nullable(),
  currency: z.string().max(8).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  pros: z.array(z.string().max(255)).max(20).optional(),
  cons: z.array(z.string().max(255)).max(20).optional(),
  best_for: z.string().max(255).optional().nullable(),
  primary_category_id: z.string().uuid().optional().nullable(),
  featured: z.boolean().optional(),
});

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, vendor, rating, featured, affiliate_url, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { products: data ?? [] };
  });

export const getAdminProduct = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { product: row };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid().optional(), values: ProductInput }).parse(i),
  )
  .handler(async ({ data }) => {
    const v: any = { ...data.values };
    for (const k of ["logo_url", "website_url", "affiliate_url"]) {
      if (v[k] === "") v[k] = null;
    }
    if (data.id) {
      const { error } = await supabaseAdmin.from("products").update(v).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("products")
        .insert(v)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- categories -------------------- */

const CategoryInput = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  sort_order: z.number().int().min(0).max(9999).optional(),
  seo_title: z.string().max(255).optional().nullable(),
  seo_description: z.string().max(500).optional().nullable(),
});

export const listAdminCategories = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return { categories: data ?? [] };
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid().optional(), values: CategoryInput }).parse(i),
  )
  .handler(async ({ data }) => {
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("categories")
        .update(data.values)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("categories")
        .insert(data.values)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* -------------------- subscribers -------------------- */

export const listAdminSubscribers = createServerFn({ method: "GET" })
  .middleware([requireAdminOrEditor])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("subscribers")
      .select("id, email, status, source, created_at, confirmed_at")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return { subscribers: data ?? [] };
  });

export const deleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireAdminOrEditor])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
