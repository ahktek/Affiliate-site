import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminProducts, deleteProduct } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsListPage,
});

function ProductsListPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminProducts);
  const del = useServerFn(deleteProduct);
  const { data, isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => list() });

  async function onDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Affiliate listings, ratings, pros & cons.</p>
        </div>
        <Link to="/admin/products/new"><Button>New product</Button></Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Vendor</th>
                <th className="text-left px-4 py-3">Rating</th>
                <th className="text-left px-4 py-3">Affiliate</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && (data?.products ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products yet.</td></tr>
              )}
              {(data?.products ?? []).map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.vendor ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{p.rating ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.affiliate_url ? (
                      <a href={p.affiliate_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">link</a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link to="/admin/products/$id" params={{ id: p.id }} className="text-primary hover:underline mr-3">Edit</Link>
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
