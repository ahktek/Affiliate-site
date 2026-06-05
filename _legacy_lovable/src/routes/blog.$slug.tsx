import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { getPostBySlug } from "@/lib/posts.functions";
import { renderTiptapRich } from "@/lib/tiptap-render";
import { formatDate } from "@/lib/format";
import { SITE_NAME, truncate } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const res = await getPostBySlug({ data: { slug: params.slug } });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const title = p?.seo_title || p?.title || "Article";
    const desc = truncate(p?.seo_description || p?.excerpt || "");
    const image = p?.og_image_url || p?.cover_image_url || null;

    // FAQ extraction (re-render is cheap; alternative is duplicating into loader)
    const rich = p ? renderTiptapRich(p.content) : null;
    const ldScripts: Array<{ type: string; children: string }> = [];

    if (p) {
      ldScripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: desc,
          datePublished: p.published_at,
          dateModified: p.updated_at ?? p.published_at,
          image: image || undefined,
          mainEntityOfPage: `/blog/${params.slug}`,
        }),
      });
      if (rich && rich.faqs.length > 0) {
        ldScripts.push({
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: rich.faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        });
      }
    }

    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
              { name: "twitter:card", content: "summary_large_image" },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: ldScripts,
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary hover:underline">
        Back to blog
      </Link>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Couldn't load article</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </Container>
  ),
  component: BlogPost,
});

function typeLabel(t: string) {
  return t === "review" ? "Review" : t === "comparison" ? "Comparison" : t === "guide" ? "Guide" : "Article";
}
function postLink(t: string) {
  return t === "review" ? "/reviews/$slug" : t === "comparison" ? "/compare/$slug" : "/blog/$slug";
}

function BlogPost() {
  const { post, author, categories, related } = Route.useLoaderData();
  const params = Route.useParams();
  if (!post) return null;

  const rich = renderTiptapRich(post.content);
  const readingMin = post.reading_minutes ?? Math.max(1, Math.round(rich.wordCount / 220));
  const showUpdated =
    post.updated_at &&
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 86_400_000;

  const cats = categories ?? [];

  return (
    <article>
      {/* Header */}
      <Container size="md" className="pt-16">
        <Link to="/blog" className="text-xs text-muted-foreground hover:text-foreground">
          ← Back to blog
        </Link>

        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold">
            {typeLabel(post.type)}
          </span>
          {cats.map((c: any) => (
            <Link
              key={c.id}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="text-xs px-2.5 py-1 rounded-full border border-border/60 bg-surface-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-5 text-xl text-muted-foreground leading-relaxed">{post.excerpt}</p>
        )}

        <div className="mt-8 flex items-center justify-between flex-wrap gap-4 border-y border-border/60 py-5">
          <div className="flex items-center gap-3 text-sm">
            {author?.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name ?? ""}
                loading="lazy"
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="size-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.62_0.22_320)]"
              />
            )}
            <div>
              {author?.display_name && (
                <div className="font-medium text-foreground">{author.display_name}</div>
              )}
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <time dateTime={post.published_at ?? undefined}>
                  {formatDate(post.published_at)}
                </time>
                <span aria-hidden>·</span>
                <span>{readingMin} min read</span>
              </div>
            </div>
          </div>
          <ShareButtons title={post.title} path={`/blog/${params.slug}`} />
        </div>
      </Container>

      {/* Cover */}
      {post.cover_image_url && (
        <Container size="lg" className="mt-10">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-accent border border-border/60">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="size-full object-cover"
            />
          </div>
        </Container>
      )}

      {/* Body + TOC */}
      <Container size="xl" className="mt-14">
        <div className="grid lg:grid-cols-[1fr_minmax(0,640px)_1fr] gap-8">
          {/* Left rail / TOC (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents headings={rich.headings} />
            </div>
          </aside>

          {/* Article body */}
          <div className="min-w-0">
            {rich.headings.length >= 2 && (
              <details className="lg:hidden mb-8 rounded-xl border border-border/60 bg-surface p-4">
                <summary className="text-sm font-semibold cursor-pointer">
                  On this page
                </summary>
                <div className="mt-3">
                  <TableOfContents headings={rich.headings} />
                </div>
              </details>
            )}
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: rich.html }}
            />

            {/* Updated + share footer */}
            <div className="mt-12 pt-6 border-t border-border/60 flex items-center justify-between flex-wrap gap-4">
              <p className="text-xs text-muted-foreground">
                {showUpdated ? (
                  <>
                    Last updated{" "}
                    <time dateTime={post.updated_at ?? undefined}>
                      {formatDate(post.updated_at)}
                    </time>
                  </>
                ) : (
                  <>
                    Published{" "}
                    <time dateTime={post.published_at ?? undefined}>
                      {formatDate(post.published_at)}
                    </time>
                  </>
                )}
              </p>
              <ShareButtons title={post.title} path={`/blog/${params.slug}`} />
            </div>
          </div>

          {/* Right rail */}
          <aside className="hidden lg:block" />
        </div>
      </Container>

      {/* Author block */}
      {author?.display_name && (
        <Container size="md" className="mt-16">
          <div className="rounded-3xl border border-border/60 bg-surface-muted p-8 flex items-start gap-5">
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.display_name}
                loading="lazy"
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden
                className="size-16 rounded-full bg-gradient-to-br from-primary to-[oklch(0.62_0.22_320)]"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Written by
              </p>
              <h2 className="mt-1 text-lg font-semibold">{author.display_name}</h2>
              {author.bio && (
                <p className="mt-2 text-sm text-muted-foreground">{author.bio}</p>
              )}
              {(author.website || author.twitter) && (
                <div className="mt-3 flex items-center gap-3 text-xs">
                  {author.website && (
                    <a
                      href={author.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Website ↗
                    </a>
                  )}
                  {author.twitter && (
                    <a
                      href={`https://twitter.com/${author.twitter.replace(/^@/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      @{author.twitter.replace(/^@/, "")}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      )}

      {/* Newsletter */}
      <Container size="md" className="mt-16">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted p-8 sm:p-10 shadow-[var(--shadow-card)]">
          <h2 className="text-2xl font-semibold tracking-tight">
            Get reviews like this in your inbox
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            One short email a week. No spam, unsubscribe in one click.
          </p>
          <div className="mt-5 max-w-md">
            <NewsletterForm source="article" compact />
          </div>
        </div>
      </Container>

      {/* Related posts */}
      {related && related.length > 0 && (
        <Container size="xl" className="mt-20 mb-16">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Keep reading</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline">
              All articles →
            </Link>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {related.map((r: any) => (
              <Link
                key={r.id}
                to={postLink(r.type)}
                params={{ slug: r.slug }}
                className="group rounded-2xl border border-border/60 bg-surface overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition"
              >
                {r.cover_image_url && (
                  <div className="aspect-[16/9] bg-accent overflow-hidden">
                    <img
                      src={r.cover_image_url}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">
                    {typeLabel(r.type)}
                  </div>
                  <h3 className="mt-2 text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                    {r.title}
                  </h3>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {formatDate(r.published_at)}
                    {r.reading_minutes ? ` · ${r.reading_minutes} min` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      )}
    </article>
  );
}
