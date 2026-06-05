import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { listPublishedPosts } from "@/lib/posts.functions";
import { formatDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/compare")({
  loader: async () => {
    const { posts } = await listPublishedPosts({ data: { type: "comparison", limit: 30 } });
    return { posts };
  },
  head: () => ({
    meta: [
      { title: `AI tool comparisons — ${SITE_NAME}` },
      { name: "description", content: "Side-by-side comparisons of the AI tools you're choosing between." },
      { property: "og:title", content: `AI tool comparisons — ${SITE_NAME}` },
      { property: "og:description", content: "X vs Y, decided. Side-by-side feature, pricing and verdict comparisons." },
      { property: "og:url", content: "/compare" },
    ],
    links: [{ rel: "canonical", href: "/compare" }],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { posts } = Route.useLoaderData();
  return (
    <Container size="xl" className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Comparisons</h1>
        <p className="mt-3 text-muted-foreground">Head-to-head breakdowns to help you pick the right tool.</p>
      </header>
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        {posts.length === 0 && <p className="text-muted-foreground">Comparisons coming soon.</p>}
        {posts.map((p: any) => (
          <Link
            key={p.id}
            to="/compare/$slug"
            params={{ slug: p.slug }}
            className="group rounded-2xl border border-border/60 bg-surface p-6 hover:shadow-[var(--shadow-card)] transition"
          >
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">Comparison</div>
            <h2 className="mt-2 text-xl font-semibold leading-tight group-hover:text-primary transition-colors">{p.title}</h2>
            {p.excerpt && <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>}
            <div className="mt-4 text-xs text-muted-foreground">{formatDate(p.published_at)}</div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
