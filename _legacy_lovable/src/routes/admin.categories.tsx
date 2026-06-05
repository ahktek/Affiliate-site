import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminCategories, upsertCategory, deleteCategory } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

type Cat = {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  seo_title?: string | null;
  seo_description?: string | null;
};

function CategoriesPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminCategories);
  const upsert = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const { data, isLoading } = useQuery({ queryKey: ["admin-categories"], queryFn: () => list() });

  const [editing, setEditing] = React.useState<Cat | null>(null);
  const [open, setOpen] = React.useState(false);

  function openNew() {
    setEditing({ slug: "", name: "", sort_order: 0 });
    setOpen(true);
  }
  function openEdit(c: any) {
    setEditing(c);
    setOpen(true);
  }
  async function save(values: Cat) {
    const { id, ...rest } = values;
    await upsert({ data: { id, values: { ...rest, sort_order: Number(rest.sort_order ?? 0) } } });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }
  async function onDelete(id: string) {
    if (!confirm("Delete category?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Slugs and SEO metadata.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}>New category</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
            {editing && <CategoryForm initial={editing} onSubmit={save} />}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">SEO title</th>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && (data?.categories ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No categories.</td></tr>
              )}
              {(data?.categories ?? []).map((c: any) => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">/{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{c.seo_title ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{c.sort_order}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-primary hover:underline mr-3">Edit</button>
                    <button onClick={() => onDelete(c.id)} className="text-destructive hover:underline">Delete</button>
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

function CategoryForm({ initial, onSubmit }: { initial: Cat; onSubmit: (v: Cat) => Promise<void> }) {
  const [v, setV] = React.useState<Cat>(initial);
  const [saving, setSaving] = React.useState(false);
  function set<K extends keyof Cat>(k: K, val: Cat[K]) { setV((s) => ({ ...s, [k]: val })); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit(v); } finally { setSaving(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Name</Label><Input required value={v.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="space-y-2"><Label>Slug</Label><Input required pattern="[a-z0-9-]+" value={v.slug} onChange={(e) => set("slug", e.target.value)} /></div>
        <div className="space-y-2"><Label>Icon</Label><Input value={v.icon ?? ""} onChange={(e) => set("icon", e.target.value)} placeholder="emoji or name" /></div>
        <div className="space-y-2"><Label>Sort order</Label><Input type="number" value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="space-y-2"><Label>SEO title</Label><Input value={v.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} /></div>
      <div className="space-y-2"><Label>SEO description</Label><Textarea rows={2} value={v.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} /></div>
      <DialogFooter><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
    </form>
  );
}
