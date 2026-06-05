import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { json, requireAutomationAuth } from "@/lib/automation/auth";

const Body = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).optional(),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduled_at: z.string().datetime().optional(),
  publish_now: z.boolean().optional(),
}).refine((v) => v.id || v.slug, { message: "id or slug required" });

/**
 * Schedule, publish, or unpublish a post. Also acts as the cron drain:
 * call with `{ "publish_now": true }` (no id/slug) to publish all scheduled
 * posts whose scheduled_at has passed.
 */
export const Route = createFileRoute("/api/public/automation/posts/schedule")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const unauth = requireAutomationAuth(request);
        if (unauth) return unauth;

        const raw = await request.json().catch(() => ({}));

        // Drain mode: publish due scheduled posts.
        if (raw?.publish_now === true && !raw?.id && !raw?.slug) {
          const nowIso = new Date().toISOString();
          const { data, error } = await supabaseAdmin
            .from("posts")
            .update({ status: "published", published_at: nowIso })
            .lte("scheduled_at", nowIso)
            .eq("status", "scheduled")
            .select("id, slug");
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true, published: data ?? [] });
        }

        let parsed;
        try {
          parsed = Body.parse(raw);
        } catch (e: any) {
          return json({ error: "Invalid payload", details: e?.errors ?? String(e) }, 400);
        }

        const patch: {
          status: "draft" | "scheduled" | "published";
          published_at?: string | null;
          scheduled_at?: string | null;
        } = { status: parsed.status };
        if (parsed.status === "published") {
          patch.published_at = new Date().toISOString();
          patch.scheduled_at = null;
        } else if (parsed.status === "scheduled") {
          if (!parsed.scheduled_at) return json({ error: "scheduled_at required" }, 400);
          patch.scheduled_at = parsed.scheduled_at;
        } else {
          patch.scheduled_at = null;
        }

        let q = supabaseAdmin.from("posts").update(patch);
        q = parsed.id ? q.eq("id", parsed.id) : q.eq("slug", parsed.slug!);
        const { data, error } = await q.select("id, slug, status, published_at, scheduled_at").maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Post not found" }, 404);
        return json({ ok: true, post: data });
      },
    },
  },
});
