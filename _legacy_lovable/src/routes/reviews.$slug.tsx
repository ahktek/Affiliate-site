import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { getPostBySlug } from "@/lib/posts.functions";
import { renderTiptap } from "@/lib/tiptap-render";
import { formatDate } from "@/lib/format";
import { SITE_NAME, truncate } from "@/lib/seo";

export const Route = createFileRoute("/reviews/$slug")({
  loader: async ({ params }) => {
    const res = await getPostBySlug({ data: { slug: params.slug } });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p?.seo_title || p?.title || "Review";
    const desc = truncate(p?.seo_description || p?.excerpt || "");
    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/reviews/${params.slug}` },
        ...(p?.og_image_url || p?.cover_image_url
          ? [{ property: "og:image", content: p.og_image_url || p.cover_image_url! }]
          : []),
      ],
      links: [{ rel: "canonical", href: `/reviews/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Review not found</h1>
      <Link to="/reviews" className="mt-4 inline-block text-primary hover:underline">All reviews</Link>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Could not load review</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </Container>
  ),
  component: ReviewPage,
});

function ReviewPage() {
  const { post, author } = Route.useLoaderData();
  if (!post) return null;
  const html = renderTiptap(post.content);

  return (
    <article>
      <Container size="md" className="pt-16">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">Review</div>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">{post.title}</h1>
        {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
          {author?.display_name && <span className="text-foreground font-medium">{author.display_name}</span>}
          <span>·</span>
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
          {post.reading_minutes && <><span>·</span><span>{post.reading_minutes} min read</span></>}
        </div>
      </Container>
      {post.cover_image_url && (
        <Container size="lg" className="mt-10">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-accent">
            <img src={post.cover_image_url} alt="" className="size-full object-cover" loading="eager" fetchPriority="high" decoding="async" />
          </div>
        </Container>
      )}
      <Container size="md" className="mt-12">
        <div className="prose-content text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
    </article>
  );
}
