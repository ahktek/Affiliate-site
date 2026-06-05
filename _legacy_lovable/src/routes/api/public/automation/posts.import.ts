import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { json, requireAutomationAuth } from "@/lib/automation/auth";
import { uniquePostSlug, slugify } from "@/lib/automation/slug";
import { generateMetadata, estimateReadingMinutes } from "@/lib/automation/metadata";
import { importImageFromUrl } from "@/lib/automation/image";
import { autoAssignCategory, setPostCategories } from "@/lib/automation/categories";
import { resolveAutomationAuthorId } from "@/lib/automation/author";

const Body = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(200).optional(),
  type: z.enum(["article", "review", "comparison", "guide"]).default("article"),
  content: z.any(),
  excerpt: z.string().max(500).optional(),
  cover_image_url: z.string().url().optional(),
  import_cover: z.boolean().default(true),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  scheduled_at: z.string().datetime().optional(),
  primary_category_id: z.string().uuid().optional(),
  category_ids: z.array(z.string().uuid()).optional(),
  auto_categorize: z.boolean().default(true),
  generate_metadata: z.boolean().default(true),
  featured: z.boolean().default(false),
  author_id: z.string().uuid().optional(),
  seo_title: z.string().max(120).optional(),
  seo_description: z.string().max(300).optional(),
});

export const Route = createFileRoute("/api/public/automation/posts/import")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = requireAutomationAuth(request);
        if (unauth) return unauth;

        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch (e: any) {
          return json({ error: "Invalid payload", details: e?.errors ?? String(e) }, 400);
        }

        try {
          const author_id = await resolveAutomationAuthorId(parsed.author_id);

          // Metadata generation
          let meta = parsed.generate_metadata
            ? await generateMetadata({ title: parsed.title, content: parsed.content })
            : null;

          const title = parsed.title || meta?.title || "Untitled";
          const slugBase = parsed.slug || meta?.slug_hint || title;
          const slug = await uniquePostSlug(slugBase);

          // Cover image
          let coverUrl: string | null = parsed.cover_image_url ?? null;
          if (coverUrl && parsed.import_cover) {
            try {
              const r = await importImageFromUrl(coverUrl, { filenameHint: slug });
              coverUrl = r.url;
            } catch (e) {
              console.warn("[automation/posts.import] cover import failed:", e);
            }
          }

          // Category resolution
          let primary_category_id = parsed.primary_category_id ?? null;
          let category_ids = parsed.category_ids ?? [];
          if (!primary_category_id && parsed.auto_categorize) {
            const text = [title, parsed.excerpt, meta?.excerpt, JSON.stringify(parsed.content)]
              .filter(Boolean)
              .join(" ");
            const r = await autoAssignCategory(text);
            primary_category_id = r.primaryCategoryId;
            if (primary_category_id && category_ids.length === 0) {
              category_ids = [primary_category_id];
            }
          }

          const now = new Date().toISOString();
          const status = parsed.status;
          const published_at = status === "published" ? now : null;
          const scheduled_at =
            status === "scheduled" ? parsed.scheduled_at ?? null : null;

          const insert = {
            slug,
            type: parsed.type,
            title,
            excerpt: parsed.excerpt ?? meta?.excerpt ?? null,
            content: parsed.content ?? null,
            cover_image_url: coverUrl,
            author_id,
            status,
            published_at,
            scheduled_at,
            primary_category_id,
            seo_title: parsed.seo_title ?? meta?.seo_title ?? null,
            seo_description: parsed.seo_description ?? meta?.seo_description ?? null,
            reading_minutes:
              meta?.reading_minutes ?? estimateReadingMinutes(JSON.stringify(parsed.content ?? "")),
            featured: parsed.featured,
          };

          const { data: post, error } = await supabaseAdmin
            .from("posts")
            .insert(insert)
            .select("id, slug, status, published_at, scheduled_at")
            .single();
          if (error) throw new Error(error.message);

          if (category_ids.length > 0) {
            await setPostCategories(post.id, Array.from(new Set(category_ids)));
          }

          return json({ ok: true, post, metadata: meta });
        } catch (e: any) {
          console.error("[automation/posts.import]", e);
          return json({ error: e?.message ?? "Import failed" }, 500);
        }
      },
    },
  },
});
