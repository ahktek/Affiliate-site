import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminCategories } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export type ProductValues = {
  slug: string;
  name: string;
  vendor?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  affiliate_url?: string | null;
  short_description?: string | null;
  pricing_model?: string | null;
  starting_price?: number | null;
  currency?: string | null;
  rating?: number | null;
  pros?: string[];
  cons?: string[];
  best_for?: string | null;
  primary_category_id?: string | null;
  featured?: boolean;
};

const DEFAULTS: ProductValues = {
  slug: "",
  name: "",
  vendor: "",
  logo_url: "",
  website_url: "",
  affiliate_url: "",
  short_description: "",
  pricing_model: "",
  starting_price: null,
  currency: "USD",
  rating: null,
  pros: [],
  cons: [],
  best_for: "",
  primary_category_id: "",
  featured: false,
};

export function ProductForm({
  initial,
  onSubmit,
  submitLabel = "Save",
}: {
  initial?: Partial<ProductValues>;
  onSubmit: (v: ProductValues) => Promise<void> | void;
  submitLabel?: string;
}) {
  const [v, setV] = React.useState<ProductValues>({ ...DEFAULTS, ...initial });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const listCats = useServerFn(listAdminCategories);
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: () => listCats() });

  function set<K extends keyof ProductValues>(k: K, val: ProductValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        ...v,
        primary_category_id: v.primary_category_id || null,
        starting_price: v.starting_price === null || v.starting_price === undefined || (v.starting_price as any) === "" ? null : Number(v.starting_price),
        rating: v.rating === null || v.rating === undefined || (v.rating as any) === "" ? null : Number(v.rating),
        pros: (v.pros ?? []).filter(Boolean),
        cons: (v.cons ?? []).filter(Boolean),
      });
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={v.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" required pattern="[a-z0-9-]+" value={v.slug} onChange={(e) => set("slug", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" value={v.vendor ?? ""} onChange={(e) => set("vendor", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="best_for">Best for</Label>
              <Input id="best_for" value={v.best_for ?? ""} onChange={(e) => set("best_for", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_description">Short description</Label>
            <Textarea id="short_description" rows={3} value={v.short_description ?? ""} onChange={(e) => set("short_description", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Affiliate links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input id="website_url" type="url" value={v.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affiliate_url">Affiliate URL</Label>
              <Input id="affiliate_url" type="url" value={v.affiliate_url ?? ""} onChange={(e) => set("affiliate_url", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" type="url" value={v.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Pricing & rating</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="pricing_model">Pricing model</Label>
              <Input id="pricing_model" value={v.pricing_model ?? ""} onChange={(e) => set("pricing_model", e.target.value)} placeholder="freemium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="starting_price">Starting price</Label>
              <Input id="starting_price" type="number" step="0.01" value={v.starting_price ?? ""} onChange={(e) => set("starting_price", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" value={v.currency ?? ""} onChange={(e) => set("currency", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input id="rating" type="number" step="0.1" min={0} max={5} value={v.rating ?? ""} onChange={(e) => set("rating", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
          </div>
        </div>

        <ChipsEditor label="Pros" values={v.pros ?? []} onChange={(arr) => set("pros", arr)} />
        <ChipsEditor label="Cons" values={v.cons ?? []} onChange={(arr) => set("cons", arr)} />
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold">Taxonomy</h2>
          <div className="space-y-2">
            <Label>Primary category</Label>
            <Select
              value={v.primary_category_id || "none"}
              onValueChange={(val) => set("primary_category_id", val === "none" ? null : val)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(cats.data?.categories ?? []).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
            <Switch id="featured" checked={!!v.featured} onCheckedChange={(c) => set("featured", c)} />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : submitLabel}</Button>
      </div>
    </form>
  );
}

function ChipsEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = React.useState("");
  function add() {
    const t = draft.trim();
    if (!t) return;
    onChange([...(values ?? []), t]);
    setDraft("");
  }
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {(values ?? []).map((val, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
            {val}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={`Add ${label.toLowerCase()}…`} />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}
