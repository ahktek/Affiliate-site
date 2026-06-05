import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { NewsletterForm } from "@/components/newsletter/NewsletterForm";
import { listPublishedPosts } from "@/lib/posts.functions";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { formatDate, formatPrice, stars } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [featured, latest, products, cats] = await Promise.all([
      listPublishedPosts({ data: { featured: true, limit: 3 } }),
      listPublishedPosts({ data: { limit: 6 } }),
      listProducts({ data: { featured: true, limit: 6 } }),
      listCategories(),
    ]);
    return {
      featuredPosts: featured.posts,
      latestPosts: latest.posts,
      featuredProducts: products.products,
      categories: cats.categories,
    };
  },
  head: () => ({
    meta: [
      { property: "og:url", content: "/" },
      {
        name: "description",
        content:
          "Independent, hands-on reviews and comparisons of the best AI tools and SaaS — pricing, pros, cons, and what to pick.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  vendor: string | null;
  logo_url: string | null;
  short_description: string | null;
  pricing_model: string | null;
  starting_price: number | null;
  currency: string | null;
  rating: number | null;
  featured: boolean | null;
};

type PostRow = {
  id: string;
  slug: string;
  type: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  reading_minutes: number | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
};

const TESTIMONIALS = [
  {
    quote:
      "Stackpilot saved my team weeks of evaluation. The comparison tables alone replaced three internal Notion docs.",
    name: "Alex Tran",
    role: "Head of Growth, Lumen",
  },
  {
    quote:
      "Finally a review site that doesn't read like a press release. I trust the verdicts — and the discount codes pay for themselves.",
    name: "Priya Shah",
    role: "Indie founder",
  },
  {
    quote:
      "The weekly newsletter is the only AI roundup I actually open. Short, opinionated, and never bloated.",
    name: "Marcus Lee",
    role: "Product designer",
  },
];

function HomePage() {
  const { featuredPosts, latestPosts, featuredProducts, categories } = Route.useLoaderData();

  const featuredReviews = (featuredPosts as PostRow[])
    .filter((p) => p.type === "review")
    .concat((latestPosts as PostRow[]).filter((p) => p.type === "review"))
    .slice(0, 3);

  const heroReviews =
    featuredReviews.length > 0
      ? featuredReviews
      : (featuredPosts as PostRow[]).slice(0, 3);

  const compareProducts = (featuredProducts as ProductRow[]).slice(0, 4);

  return (
    <>
      {/* 1. HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, oklch(0.62 0.22 268 / 0.14), transparent 70%), radial-gradient(45% 45% at 85% 25%, oklch(0.62 0.22 320 / 0.10), transparent 70%), radial-gradient(40% 40% at 10% 30%, oklch(0.7 0.18 200 / 0.08), transparent 70%)",
          }}
        />
        <Container size="xl" className="pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="max-w-4xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-primary">
              <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
              AI tools, reviewed honestly
            </p>
            <h1 className="mt-5 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
              Find the AI tools{" "}
              <span className="gradient-text">actually worth paying for</span>.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Independent, hands-on reviews and side-by-side comparisons. No fluff, no recycled
              marketing copy — just what works, what doesn't, and what to pick.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                to="/reviews"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground px-7 text-sm font-semibold hover:opacity-90 shadow-[var(--shadow-elevated)] transition"
              >
                Browse all reviews
              </Link>
              <Link
                to="/compare"
                className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-surface px-7 text-sm font-semibold hover:bg-accent transition"
              >
                Compare tools →
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { k: "120+", v: "Tools reviewed" },
                { k: "40+", v: "In-depth guides" },
                { k: "12k+", v: "Newsletter readers" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-2xl sm:text-3xl font-semibold tracking-tight">{s.k}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Editor's picks strip */}
      {featuredProducts.length > 0 && (
        <section className="border-y border-border/60 bg-surface-muted" aria-label="Editor's picks">
          <Container size="xl" className="py-10">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Editor's picks
              </h2>
              <Link to="/tools" className="text-sm text-primary hover:underline">
                All tools →
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {(featuredProducts as ProductRow[]).map((p) => (
                <li key={p.id}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: p.slug }}
                    className="group flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface p-4 h-28 hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition"
                  >
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt={`${p.name} logo`}
                        className="size-10 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-10 rounded-md bg-accent" aria-hidden />
                    )}
                    <span className="mt-2 text-xs font-medium text-center">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 2. FEATURED AI REVIEWS */}
      {heroReviews.length > 0 && (
        <section aria-labelledby="featured-reviews">
          <Container size="xl" className="py-24">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Featured reviews
                </p>
                <h2
                  id="featured-reviews"
                  className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
                >
                  Our verdicts on the tools everyone's talking about
                </h2>
              </div>
              <Link to="/reviews" className="text-sm font-medium text-primary hover:underline">
                All reviews →
              </Link>
            </div>
            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {heroReviews.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 3. POPULAR CATEGORIES */}
      {categories.length > 0 && (
        <section className="bg-surface-muted" aria-labelledby="categories-heading">
          <Container size="xl" className="py-24">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                Browse by use case
              </p>
              <h2
                id="categories-heading"
                className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
              >
                Popular categories
              </h2>
              <p className="mt-3 text-muted-foreground">
                Find tools by what you're actually trying to do.
              </p>
            </div>
            <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(categories as CategoryRow[]).map((c) => (
                <li key={c.id}>
                  <Link
                    to="/categories/$slug"
                    params={{ slug: c.slug }}
                    className="group block h-full rounded-2xl border border-border/60 bg-surface p-6 hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition"
                  >
                    <div className="text-2xl">{c.icon ?? "✨"}</div>
                    <div className="mt-3 font-semibold group-hover:text-primary transition-colors">
                      {c.name}
                    </div>
                    {c.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {c.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 4. LATEST ARTICLES */}
      {latestPosts.length > 0 && (
        <section aria-labelledby="latest-heading">
          <Container size="xl" className="py-24">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Fresh off the desk
                </p>
                <h2
                  id="latest-heading"
                  className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
                >
                  Latest articles
                </h2>
              </div>
              <Link to="/blog" className="text-sm font-medium text-primary hover:underline">
                All articles →
              </Link>
            </div>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(latestPosts as PostRow[]).map((p) => (
                <PostCard key={p.id} post={p} compact />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 5. COMPARISON TABLE PREVIEW */}
      {compareProducts.length >= 2 && (
        <section className="bg-surface-muted" aria-labelledby="compare-heading">
          <Container size="xl" className="py-24">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="max-w-xl">
                <p className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Side by side
                </p>
                <h2
                  id="compare-heading"
                  className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
                >
                  Quick comparison
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Pricing, rating, and what each tool is best for — at a glance.
                </p>
              </div>
              <Link to="/compare" className="text-sm font-medium text-primary hover:underline">
                Full comparisons →
              </Link>
            </div>

            <div className="mt-10 overflow-hidden rounded-3xl border border-border/60 bg-surface shadow-[var(--shadow-card)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted/60">
                    <tr className="text-left">
                      <th scope="col" className="px-6 py-4 font-semibold">Tool</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Rating</th>
                      <th scope="col" className="px-6 py-4 font-semibold">Starts at</th>
                      <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">
                        Best for
                      </th>
                      <th scope="col" className="px-6 py-4 font-semibold text-right">Try it</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {compareProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-muted/40 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to="/tools/$slug"
                            params={{ slug: p.slug }}
                            className="flex items-center gap-3 font-medium hover:text-primary"
                          >
                            {p.logo_url ? (
                              <img
                                src={p.logo_url}
                                alt=""
                                loading="lazy"
                                className="size-8 rounded-md object-contain bg-surface-muted p-1"
                              />
                            ) : (
                              <div className="size-8 rounded-md bg-accent" aria-hidden />
                            )}
                            <span>{p.name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-warning" aria-label={`${p.rating ?? 0} out of 5`}>
                            {stars(p.rating)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatPrice(p.starting_price, p.currency ?? "USD")}
                          {p.pricing_model ? (
                            <span className="text-xs ml-1 opacity-70">/ {p.pricing_model}</span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                          {p.short_description ? (
                            <span className="line-clamp-1">{p.short_description}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to="/go/$slug"
                            params={{ slug: p.slug }}
                            className="inline-flex h-9 items-center justify-center rounded-full bg-primary text-primary-foreground px-4 text-xs font-semibold hover:opacity-90 transition"
                          >
                            Visit →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 6. NEWSLETTER */}
      <section aria-labelledby="newsletter-heading">
        <Container size="md" className="py-24">
          <div
            className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted p-8 sm:p-14 shadow-[var(--shadow-elevated)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, oklch(0.62 0.22 268 / 0.18), transparent)",
              }}
            />
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              The Stackpilot newsletter
            </p>
            <h2
              id="newsletter-heading"
              className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
            >
              One short email a week.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              The best new AI tools we tried, the ones we dropped, and the discounts worth knowing
              about. No spam, unsubscribe in one click.
            </p>
            <div className="mt-7 max-w-md">
              <NewsletterForm source="home" compact />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Join 12,000+ founders, builders, and operators.
            </p>
          </div>
        </Container>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="bg-surface-muted" aria-labelledby="testimonials-heading">
        <Container size="xl" className="py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary">
              Loved by operators
            </p>
            <h2
              id="testimonials-heading"
              className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight"
            >
              What readers say
            </h2>
          </div>
          <ul className="mt-10 grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <li
                key={t.name}
                className="rounded-2xl border border-border/60 bg-surface p-7 shadow-[var(--shadow-card)] flex flex-col"
              >
                <div className="text-warning" aria-hidden>★★★★★</div>
                <blockquote className="mt-4 text-base leading-relaxed flex-1">
                  “{t.quote}”
                </blockquote>
                <footer className="mt-6 flex items-center gap-3">
                  <div
                    aria-hidden
                    className="size-10 rounded-full bg-gradient-to-br from-primary to-[oklch(0.62_0.22_320)] flex items-center justify-center text-primary-foreground font-semibold text-sm"
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </footer>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

function PostCard({ post, compact = false }: { post: PostRow; compact?: boolean }) {
  const isReview = post.type === "review";
  const isComparison = post.type === "comparison";
  const to = isReview ? "/reviews/$slug" : isComparison ? "/compare/$slug" : "/blog/$slug";
  const label =
    post.type === "review"
      ? "Review"
      : post.type === "comparison"
        ? "Comparison"
        : post.type === "guide"
          ? "Guide"
          : "Article";
  return (
    <Link
      to={to}
      params={{ slug: post.slug }}
      className="group block rounded-2xl border border-border/60 bg-surface overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:border-primary/30 transition"
    >
      {post.cover_image_url && !compact && (
        <div className="aspect-[16/9] bg-accent overflow-hidden">
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            className="size-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="text-xs uppercase tracking-wider text-primary font-semibold">{label}</div>
        <h3 className="mt-2 text-lg font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(post.published_at)}</span>
          {post.reading_minutes ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.reading_minutes} min read</span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
