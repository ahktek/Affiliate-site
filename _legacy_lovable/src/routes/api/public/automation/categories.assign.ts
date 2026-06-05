import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, requireAutomationAuth } from "@/lib/automation/auth";
import { autoAssignCategory, setPostCategories } from "@/lib/automation/categories";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Body = z.object({
  text: z.string().min(1).max(20000).optional(),
  post_id: z.string().uuid().optional(),
  apply: z.boolean().default(false),
}).refine((v) => v.text || v.post_id, { message: "text or post_id required" });

export const Route = createFileRoute("/api/public/automation/categories/assign")({
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
          let text = parsed.text ?? "";
          if (!text && parsed.post_id) {
            const { data, error } = await supabaseAdmin
              .from("posts")
              .select("title, excerpt, content")
              .eq("id", parsed.post_id)
              .maybeSingle();
            if (error) throw new Error(error.message);
            if (!data) return json({ error: "Post not found" }, 404);
            text = [data.title, data.excerpt, JSON.stringify(data.content)]
              .filter(Boolean)
              .join(" ");
          }
          const r = await autoAssignCategory(text);
          if (parsed.apply && parsed.post_id && r.primaryCategoryId) {
            const { error: upErr } = await supabaseAdmin
              .from("posts")
              .update({ primary_category_id: r.primaryCategoryId })
              .eq("id", parsed.post_id);
            if (upErr) throw new Error(upErr.message);
            await setPostCategories(parsed.post_id, [r.primaryCategoryId]);
          }
          return json({ ok: true, ...r });
        } catch (e: any) {
          console.error("[automation/categories.assign]", e);
          return json({ error: e?.message ?? "Assignment failed" }, 500);
        }
      },
    },
  },
});
