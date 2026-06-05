import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminPost, updatePost, deletePost } from "@/lib/admin.functions";
import { PostForm, type PostValues } from "@/components/admin/PostForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/posts/$id")({
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getAdminPost);
  const upd = useServerFn(updatePost);
  const del = useServerFn(deletePost);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => get({ data: { id } }),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!data?.post) return <div>Not found.</div>;
  const p = data.post;

  async function onSubmit(v: PostValues) {
    await upd({ data: { id, patch: v } });
    qc.invalidateQueries({ queryKey: ["admin-post", id] });
    qc.invalidateQueries({ queryKey: ["admin-posts"] });
  }
  async function onDelete() {
    if (!confirm("Delete this post?")) return;
    await del({ data: { id } });
    navigate({ to: "/admin/posts" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </div>
      <PostForm
        initial={{
          slug: p.slug,
          type: p.type,
          title: p.title,
          excerpt: p.excerpt ?? "",
          content: p.content ?? null,
          cover_image_url: p.cover_image_url ?? "",
          primary_category_id: p.primary_category_id ?? "",
          status: p.status,
          scheduled_at: p.scheduled_at,
          reading_minutes: p.reading_minutes,
          seo_title: p.seo_title ?? "",
          seo_description: p.seo_description ?? "",
          og_image_url: p.og_image_url ?? "",
          featured: p.featured,
        }}
        onSubmit={onSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
