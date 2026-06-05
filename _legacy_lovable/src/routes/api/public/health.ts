import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const checks: Record<string, { ok: boolean; latency_ms: number; detail?: string }> = {};
        const overall = { ok: true, timestamp: new Date().toISOString() };

        // 1. Verify env vars are present
        const envStart = performance.now();
        const url = process.env.SUPABASE_URL || "";
        const key = process.env.SUPABASE_PUBLISHABLE_KEY || "";
        checks.env = {
          ok: Boolean(url && key),
          latency_ms: Math.round(performance.now() - envStart),
          detail: url ? "SUPABASE_URL present" : "SUPABASE_URL missing",
        };

        // 2. Database connectivity (lightweight query)
        const dbStart = performance.now();
        try {
          const { data, error } = await supabaseAdmin
            .from("categories")
            .select("id")
            .limit(1);
          checks.database = {
            ok: !error && data !== null,
            latency_ms: Math.round(performance.now() - dbStart),
            detail: error ? error.message : "Connected",
          };
        } catch (e: any) {
          checks.database = {
            ok: false,
            latency_ms: Math.round(performance.now() - dbStart),
            detail: e?.message ?? "Exception",
          };
        }

        // 3. Auth service reachability (server-side getUser with dummy token fails fast but proves network)
        const authStart = performance.now();
        try {
          // A lightweight way to confirm the auth endpoint is reachable:
          // We call getUser with an invalid token; it should return 401, not a network error.
          const { error } = await supabaseAdmin.auth.getUser("invalid-token-test");
          const isNetworkError = error?.message?.toLowerCase().includes("fetch") || error?.message?.toLowerCase().includes("network");
          checks.auth = {
            ok: !isNetworkError, // 401 is expected; network failure is the problem
            latency_ms: Math.round(performance.now() - authStart),
            detail: error ? error.message : "Auth endpoint reachable",
          };
        } catch (e: any) {
          checks.auth = {
            ok: false,
            latency_ms: Math.round(performance.now() - authStart),
            detail: e?.message ?? "Auth exception",
          };
        }

        overall.ok = Object.values(checks).every((c) => c.ok);

        return Response.json({ overall, checks }, { status: overall.ok ? 200 : 503 });
      },
    },
  },
});
