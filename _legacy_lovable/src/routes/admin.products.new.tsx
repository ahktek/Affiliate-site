import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { upsertProduct } from "@/lib/admin.functions";
import { ProductForm, type ProductValues } from "@/components/admin/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const upsert = useServerFn(upsertProduct);
  async function onSubmit(v: ProductValues) {
    const res = await upsert({ data: { values: v } });
    navigate({ to: "/admin/products/$id", params: { id: res.id } });
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New product</h1>
      <ProductForm onSubmit={onSubmit} submitLabel="Create" />
    </div>
  );
}
