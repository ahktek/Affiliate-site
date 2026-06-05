import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createPost } from "@/lib/admin.functions";
import { PostForm, type PostValues } from "@/components/admin/PostForm";

export const Route = createFileRoute("/admin/posts/new")({
  component: NewPostPage,
});

function NewPostPage() {
  const navigate = useNavigate();
  const create = useServerFn(createPost);
  async function onSubmit(v: PostValues) {
    const res = await create({ data: v });
    navigate({ to: "/admin/posts/$id", params: { id: res.id } });
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New post</h1>
      <PostForm onSubmit={onSubmit} submitLabel="Create" />
    </div>
  );
}
