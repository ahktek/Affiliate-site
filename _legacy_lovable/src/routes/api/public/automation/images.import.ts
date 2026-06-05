import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, requireAutomationAuth } from "@/lib/automation/auth";
import { importImageFromUrl } from "@/lib/automation/image";

const Body = z.object({
  url: z.string().url(),
  filename_hint: z.string().max(120).optional(),
});

export const Route = createFileRoute("/api/public/automation/images/import")({
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
          const r = await importImageFromUrl(parsed.url, { filenameHint: parsed.filename_hint });
          return json({ ok: true, ...r });
        } catch (e: any) {
          console.error("[automation/images.import]", e);
          return json({ error: e?.message ?? "Image import failed" }, 500);
        }
      },
    },
  },
});
