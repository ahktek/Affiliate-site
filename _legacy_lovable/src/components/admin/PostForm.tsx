import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminCategories } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PostValues = {
  slug: string;
  type: "article" | "review" | "comparison" | "guide";
  title: string;
  excerpt?: string | null;
  content?: any;
  cover_image_url?: string | null;
  primary_category_id?: string | null;
  status: "draft" | "scheduled" | "published";
  scheduled_at?: string | null;
  published_at?: string | null;
  reading_minutes?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  featured?: boolean;
};

const DEFAULTS: PostValues = {
  slug: "",
  type: "article",
  title: "",
  excerpt: "",
  content: null,
  cover_image_url: "",
  primary_category_id: "",
  status: "draft",
  scheduled_at: null,
  reading_minutes: null,
  seo_title: "",
  seo_description: "",
  og_image_url: "",
  featured: false,
};

export function PostForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: {
  initial?: Partial<PostValues>;
  onSubmit: (values: PostValues) => Promise<void> | void;
  submitLabel?: string;
}) {
  const [v, setV] = React.useState<PostValues>({ ...DEFAULTS, ...initial });
  const [contentText, setContentText] = React.useState<string>(
    initial?.content ? JSON.stringify(initial.content, null, 2) : "",
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const listCats = useServerFn(listAdminCategories);
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: () => listCats() });

  function set<K extends keyof PostValues>(k: K, val: PostValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let content: any = null;
      if (contentText.trim()) {
        try {
          content = JSON.parse(contentText);
        } catch {
          throw new Error("Content must be valid JSON (Tiptap document) or empty.");
        }
      }
      const payload: PostValues = {
        ...v,
        content,
        primary_category_id: v.primary_category_id || null,
        scheduled_at: v.status === "scheduled" ? v.scheduled_at : null,
        reading_minutes: v.reading_minutes ? Number(v.reading_minutes) : null,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={v.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" required pattern="[a-z0-9-]+" value={v.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={v.type} onValueChange={(val) => set("type", val as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={3} value={v.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Tiptap JSON)</Label>
            <Textarea
              id="content"
              rows={14}
              className="font-mono text-xs"
              placeholder='{"type":"doc","content":[...]}'
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">SEO</h2>
          <div className="space-y-2">
            <Label htmlFor="seo_title">SEO title</Label>
            <Input id="seo_title" value={v.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo_description">SEO description</Label>
            <Textarea id="seo_description" rows={2} value={v.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og_image_url">OG image URL</Label>
            <Input id="og_image_url" type="url" value={v.og_image_url ?? ""} onChange={(e) => set("og_image_url", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Publish</h2>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={v.status} onValueChange={(val) => set("status", val as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {v.status === "scheduled" && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled for</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={v.scheduled_at ? toLocalInput(v.scheduled_at) : ""}
                onChange={(e) => set("scheduled_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
            <Switch id="featured" checked={!!v.featured} onCheckedChange={(c) => set("featured", c)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reading_minutes">Reading minutes</Label>
            <Input
              id="reading_minutes"
              type="number"
              min={1}
              max={120}
              value={v.reading_minutes ?? ""}
              onChange={(e) => set("reading_minutes", e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Taxonomy & media</h2>
          <div className="space-y-2">
            <Label>Primary category</Label>
            <Select
              value={v.primary_category_id || "none"}
              onValueChange={(val) => set("primary_category_id", val === "none" ? null : val)}
            >
              <SelectTrigger><SelectValue placeholder="Choose…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(cats.data?.categories ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover image URL</Label>
            <Input id="cover_image_url" type="url" value={v.cover_image_url ?? ""} onChange={(e) => set("cover_image_url", e.target.value)} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}
