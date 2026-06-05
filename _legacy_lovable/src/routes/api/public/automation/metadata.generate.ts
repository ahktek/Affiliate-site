import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, requireAutomationAuth } from "@/lib/automation/auth";
import { generateMetadata } from "@/lib/automation/metadata";
import { slugify } from "@/lib/automation/slug";

const Body = z.object({
  title: z.string().max(300).optional(),
  content: z.any().optional().default(""),
  hint: z.string().max(500).optional(),
});

export const Route = createFileRoute("/api/public/automation/metadata/generate")({
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
          const meta = await generateMetadata({ ...parsed, content: parsed.content ?? "" });
          return json({ ok: true, metadata: { ...meta, slug: slugify(meta.slug_hint) } });
        } catch (e: any) {
          console.error("[automation/metadata.generate]", e);
          return json({ error: e?.message ?? "Generation failed" }, 500);
        }
      },
    },
  },
});
