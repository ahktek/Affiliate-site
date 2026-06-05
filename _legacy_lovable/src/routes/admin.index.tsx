import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function StatCard({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const body = (
    <div className="rounded-xl border bg-card p-5 hover:shadow-sm transition">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
  return href ? <Link to={href as any}>{body}</Link> : body;
}

function DashboardPage() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">At-a-glance content & audience metrics.</p>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Posts" value={isLoading ? "…" : data!.posts} href="/admin/posts" />
        <StatCard label="Published" value={isLoading ? "…" : data!.published} href="/admin/posts" />
        <StatCard label="Drafts" value={isLoading ? "…" : data!.drafts} href="/admin/posts" />
        <StatCard label="Products" value={isLoading ? "…" : data!.products} href="/admin/products" />
        <StatCard label="Categories" value={isLoading ? "…" : data!.categories} href="/admin/categories" />
        <StatCard label="Subscribers" value={isLoading ? "…" : data!.subscribers} href="/admin/subscribers" />
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-semibold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/admin/posts/new" className="rounded-md border px-3 h-9 inline-flex items-center text-sm hover:bg-muted">New post</Link>
          <Link to="/admin/products/new" className="rounded-md border px-3 h-9 inline-flex items-center text-sm hover:bg-muted">New product</Link>
          <Link to="/admin/categories" className="rounded-md border px-3 h-9 inline-flex items-center text-sm hover:bg-muted">Manage categories</Link>
        </div>
      </div>
    </div>
  );
}
