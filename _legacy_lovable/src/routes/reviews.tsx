import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { listPublishedPosts } from "@/lib/posts.functions";
import { formatDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/reviews")({
  loader: async () => {
    const { posts } = await listPublishedPosts({ data: { type: "review", limit: 50 } });
    return { posts };
  },
  head: () => ({
    meta: [
      { title: `AI tool reviews — ${SITE_NAME}` },
      { name: "description", content: "In-depth, hands-on reviews of the leading AI tools and SaaS products." },
      { property: "og:title", content: `AI tool reviews — ${SITE_NAME}` },
      { property: "og:description", content: "In-depth, hands-on reviews of the leading AI tools and SaaS products." },
      { property: "og:url", content: "/reviews" },
    ],
    links: [{ rel: "canonical", href: "/reviews" }],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { posts } = Route.useLoaderData();
  return (
    <Container size="xl" className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-3 text-muted-foreground">Every tool tested by a human. Real workflows, real verdicts.</p>
      </header>
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 && <p className="text-muted-foreground">Reviews coming soon.</p>}
        {posts.map((p: any) => (
          <Link
            key={p.id}
            to="/reviews/$slug"
            params={{ slug: p.slug }}
            className="group rounded-2xl border border-border/60 bg-surface overflow-hidden hover:shadow-[var(--shadow-elevated)] transition"
          >
            {p.cover_image_url && (
              <div className="aspect-[16/9] bg-accent overflow-hidden">
                <img src={p.cover_image_url} alt="" loading="lazy" className="size-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold">Review</div>
              <h2 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{p.title}</h2>
              {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>}
              <div className="mt-4 text-xs text-muted-foreground">{formatDate(p.published_at)}</div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
