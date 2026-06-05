import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminProduct, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { ProductForm, type ProductValues } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products/$id")({
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getAdminProduct);
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => get({ data: { id } }),
  });
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data?.product) return <div>Not found.</div>;
  const p = data.product;

  async function onSubmit(v: ProductValues) {
    await upsert({ data: { id, values: v } });
    qc.invalidateQueries({ queryKey: ["admin-product", id] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }
  async function onDelete() {
    if (!confirm("Delete this product?")) return;
    await del({ data: { id } });
    navigate({ to: "/admin/products" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </div>
      <ProductForm
        initial={{
          slug: p.slug,
          name: p.name,
          vendor: p.vendor ?? "",
          logo_url: p.logo_url ?? "",
          website_url: p.website_url ?? "",
          affiliate_url: p.affiliate_url ?? "",
          short_description: p.short_description ?? "",
          pricing_model: p.pricing_model ?? "",
          starting_price: p.starting_price,
          currency: p.currency ?? "USD",
          rating: p.rating,
          pros: p.pros ?? [],
          cons: p.cons ?? [],
          best_for: p.best_for ?? "",
          primary_category_id: p.primary_category_id ?? "",
          featured: p.featured,
        }}
        onSubmit={onSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
