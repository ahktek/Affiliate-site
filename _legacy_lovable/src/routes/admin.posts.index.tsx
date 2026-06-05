import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminPosts, deletePost, updatePost } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/posts/")({
  component: PostsListPage,
});

function PostsListPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminPosts);
  const del = useServerFn(deletePost);
  const upd = useServerFn(updatePost);
  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => list() });
  const [filter, setFilter] = React.useState<"all" | "draft" | "scheduled" | "published">("all");

  const posts = (data?.posts ?? []).filter((p) => filter === "all" || p.status === filter);

  async function onDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }
  async function publish(id: string) {
    await upd({ data: { id, patch: { status: "published" } } });
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }
  async function unpublish(id: string) {
    await upd({ data: { id, patch: { status: "draft" } } });
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Articles, reviews, comparisons, and guides.</p>
        </div>
        <Link to="/admin/posts/new"><Button>New post</Button></Link>
      </div>

      <div className="flex gap-1 text-sm">
        {(["all", "draft", "scheduled", "published"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-md px-3 h-8 capitalize " +
              (filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Updated</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!isLoading && posts.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No posts.</td></tr>
              )}
              {posts.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{p.type}</td>
                  <td className="px-4 py-3">
                    <span className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs " +
                      (p.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : p.status === "scheduled" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-muted text-muted-foreground")
                    }>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {p.updated_at ? new Date(p.updated_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to="/admin/posts/$id" params={{ id: p.id }} className="text-primary hover:underline mr-3">Edit</Link>
                    {p.status === "published" ? (
                      <button onClick={() => unpublish(p.id)} className="text-muted-foreground hover:text-foreground mr-3">Unpublish</button>
                    ) : (
                      <button onClick={() => publish(p.id)} className="text-muted-foreground hover:text-foreground mr-3">Publish</button>
                    )}
                    <button onClick={() => onDelete(p.id)} className="text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
