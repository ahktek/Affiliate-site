import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyAdminContext } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type HealthResponse = {
  overall: { ok: boolean; timestamp: string };
  checks: Record<string, { ok: boolean; latency_ms: number; detail?: string }>;
};

function SettingsPage() {
  const fn = useServerFn(getMyAdminContext);
  const { data } = useQuery({ queryKey: ["admin-context"], queryFn: () => fn() });

  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [checking, setChecking] = React.useState(false);

  async function runHealthCheck() {
    setChecking(true);
    try {
      const res = await fetch("/api/public/health");
      const json = await res.json();
      setHealth(json as HealthResponse);
    } catch (e) {
      setHealth({
        overall: { ok: false, timestamp: new Date().toISOString() },
        checks: { client: { ok: false, latency_ms: 0, detail: String(e) } },
      });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Your account and access.</p>
      </div>
      <div className="rounded-xl border bg-card p-6 space-y-3 text-sm">
        <Row label="Email" value={data?.email ?? "—"} />
        <Row label="User ID" value={data?.userId ?? "—"} mono />
        <Row label="Roles" value={(data?.roles ?? []).join(", ") || "—"} />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Supabase Health</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Runtime check for VITE_SUPABASE_URL and connection.</p>
          </div>
          <Button variant="outline" size="sm" onClick={runHealthCheck} disabled={checking}>
            {checking ? "Checking…" : "Run check"}
          </Button>
        </div>

        {health && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall:</span>
              <Badge variant={health.overall.ok ? "default" : "destructive"}>
                {health.overall.ok ? "Healthy" : "Unhealthy"}
              </Badge>
              <span className="text-xs text-muted-foreground">{health.overall.timestamp}</span>
            </div>
            <div className="divide-y divide-border rounded-lg border">
              {Object.entries(health.checks).map(([name, c]) => (
                <div key={name} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={c.ok ? "text-emerald-600" : "text-destructive"}>{c.ok ? "●" : "●"}</span>
                    <span className="capitalize">{name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>{c.detail}</div>
                    <div>{c.latency_ms}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-3">
        <h2 className="text-sm font-semibold">Session</h2>
        <Button variant="outline" onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/login"))}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs break-all text-right" : "text-right"}>{value}</span>
    </div>
  );
}
