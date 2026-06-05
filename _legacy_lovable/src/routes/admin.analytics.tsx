import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Content & audience overview.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile label="Total posts" value={isLoading ? "…" : data!.posts} />
        <Tile label="Published" value={isLoading ? "…" : data!.published} />
        <Tile label="Drafts" value={isLoading ? "…" : data!.drafts} />
        <Tile label="Products" value={isLoading ? "…" : data!.products} />
        <Tile label="Categories" value={isLoading ? "…" : data!.categories} />
        <Tile label="Active subscribers" value={isLoading ? "…" : data!.subscribers} />
      </div>
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Connect a privacy-friendly analytics provider (Plausible, Umami, PostHog) to surface traffic & conversion charts here.
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
