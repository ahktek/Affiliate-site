import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { listPublishedPosts } from "@/lib/posts.functions";
import { formatDate } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  loader: async () => {
    const { posts } = await listPublishedPosts({ data: { limit: 30 } });
    return { posts };
  },
  head: () => ({
    meta: [
      { title: `Blog — ${SITE_NAME}` },
      {
        name: "description",
        content:
          "Hands-on articles, guides, and analysis on the AI tools and SaaS worth your time.",
      },
      { property: "og:title", content: `Blog — ${SITE_NAME}` },
      {
        property: "og:description",
        content: "Hands-on articles, guides, and analysis on the AI tools that matter.",
      },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  errorComponent: ({ error }) => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Couldn't load the blog</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </Container>
  ),
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
    </Container>
  ),
  component: BlogIndex,
});

type PostRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  reading_minutes: number | null;
  featured: boolean | null;
};

function typeLabel(t: string) {
  return t === "review" ? "Review" : t === "comparison" ? "Comparison" : t === "guide" ? "Guide" : "Article";
}
function postLink(t: string) {
  return t === "review" ? "/reviews/$slug" : t === "comparison" ? "/compare/$slug" : "/blog/$slug";
}

function BlogIndex() {
  const { posts } = Route.useLoaderData() as { posts: PostRow[] };
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="border-b border-border/60">
        <Container size="xl" className="pt-20 pb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">
            Stackpilot blog
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            Field notes on the AI tools worth your time.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Reviews, comparisons, and deep dives — written by humans who actually use these tools.
          </p>
        </Container>
      </section>

      <Container size="xl" className="py-16">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">No articles yet. Check back soon.</p>
        ) : (
          <>
            {featured && (
              <Link
                to={postLink(featured.type)}
                params={{ slug: featured.slug }}
                className="group block rounded-3xl border border-border/60 bg-surface overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {featured.cover_image_url ? (
                    <div className="aspect-[16/10] md:aspect-auto bg-accent overflow-hidden">
                      <img
                        src={featured.cover_image_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-accent to-surface-muted aspect-[16/10] md:aspect-auto" />
                  )}
                  <div className="p-8 sm:p-10 flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                      Latest · {typeLabel(featured.type)}
                    </div>
                    <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-4 text-muted-foreground line-clamp-3">{featured.excerpt}</p>
                    )}
                    <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={featured.published_at ?? undefined}>
                        {formatDate(featured.published_at)}
                      </time>
                      {featured.reading_minutes && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{featured.reading_minutes} min read</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="mt-14">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  All articles
                </h2>
                <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      to={postLink(p.type)}
                      params={{ slug: p.slug }}
                      className="group rounded-2xl border border-border/60 bg-surface overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition"
                    >
                      {p.cover_image_url && (
                        <div className="aspect-[16/9] bg-accent overflow-hidden">
                          <img
                            src={p.cover_image_url}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                          {typeLabel(p.type)}
                        </div>
                        <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {p.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <time dateTime={p.published_at ?? undefined}>
                            {formatDate(p.published_at)}
                          </time>
                          {p.reading_minutes && (
                            <>
                              <span aria-hidden>·</span>
                              <span>{p.reading_minutes} min read</span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}
