import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminSubscribers, deleteSubscriber } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/subscribers")({
  component: SubscribersPage,
});

function SubscribersPage() {
  const qc = useQueryClient();
  const list = useServerFn(listAdminSubscribers);
  const del = useServerFn(deleteSubscriber);
  const { data, isLoading } = useQuery({ queryKey: ["admin-subscribers"], queryFn: () => list() });

  const subs = data?.subscribers ?? [];

  function exportCsv() {
    const header = ["email", "status", "source", "created_at", "confirmed_at"];
    const rows = subs.map((s: any) =>
      header.map((h) => csvEscape(s[h] ?? "")).join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onDelete(id: string) {
    if (!confirm("Remove subscriber?")) return;
    await del({ data: { id } });
    qc.invalidateQueries({ queryKey: ["admin-subscribers"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-1">{subs.length} total</p>
        </div>
        <Button onClick={exportCsv} disabled={subs.length === 0}>Export CSV</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Subscribed</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && subs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No subscribers.</td></tr>
              )}
              {subs.map((s: any) => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 capitalize">{s.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.source ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDelete(s.id)} className="text-destructive hover:underline">Delete</button>
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

function csvEscape(v: any): string {
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
