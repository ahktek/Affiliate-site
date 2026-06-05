import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { getComparisonBySlug } from "@/lib/posts.functions";
import { renderTiptap } from "@/lib/tiptap-render";
import { formatPrice, stars } from "@/lib/format";
import { SITE_NAME, truncate } from "@/lib/seo";

type Product = {
  id: string;
  slug: string;
  name: string;
  vendor: string | null;
  logo_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  short_description: string | null;
  pricing_model: string | null;
  starting_price: number | null;
  currency: string | null;
  rating: number | null;
  pros: string[] | null;
  cons: string[] | null;
  best_for: string | null;
};

type Criterion = { id: string; label: string; sort_order: number };
type Score = {
  criterion_id: string;
  product_id: string;
  score: number | null;
  note: string | null;
};

function withUtm(url: string | null | undefined, slug: string) {
  if (!url) return "#";
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "stackpilot");
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "compare");
    if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", slug);
    return u.toString();
  } catch {
    return url;
  }
}

export const Route = createFileRoute("/compare/$slug")({
  loader: async ({ params }) => {
    const res = await getComparisonBySlug({ data: { slug: params.slug } });
    if (!res.post) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.post;
    const products = (loaderData?.products ?? []) as Product[];
    const title = p?.seo_title || p?.title || "Comparison";
    const desc = truncate(
      p?.seo_description ||
        p?.excerpt ||
        (products.length ? `Compare ${products.map((x) => x.name).join(" vs ")}.` : ""),
    );
    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/compare/${params.slug}` },
        ...(p?.og_image_url || p?.cover_image_url
          ? [{ property: "og:image", content: p.og_image_url || p.cover_image_url! }]
          : []),
      ],
      links: [{ rel: "canonical", href: `/compare/${params.slug}` }],
      scripts: products.length
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: p?.title,
                itemListElement: products.map((prod, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "Product",
                    name: prod.name,
                    image: prod.logo_url || undefined,
                    brand: prod.vendor ? { "@type": "Brand", name: prod.vendor } : undefined,
                    ...(prod.rating != null
                      ? {
                          aggregateRating: {
                            "@type": "AggregateRating",
                            ratingValue: Number(prod.rating),
                            bestRating: 5,
                            ratingCount: 1,
                          },
                        }
                      : {}),
                    ...(prod.starting_price != null
                      ? {
                          offers: {
                            "@type": "Offer",
                            price: Number(prod.starting_price),
                            priceCurrency: prod.currency || "USD",
                            url: prod.affiliate_url || prod.website_url || undefined,
                          },
                        }
                      : {}),
                  },
                })),
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Comparison not found</h1>
      <Link to="/compare" className="mt-4 inline-block text-primary hover:underline">
        All comparisons
      </Link>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Could not load comparison</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </Container>
  ),
  component: ComparisonPage,
});

function ComparisonPage() {
  const { post, products, criteria, scores } = Route.useLoaderData() as {
    post: any;
    products: Product[];
    criteria: Criterion[];
    scores: Score[];
  };
  const { slug } = Route.useParams();

  if (!post) return null;

  const html = renderTiptap(post.content);
  const cols = products.length || 1;
  // Tailwind needs static class names — pick a min-width per column for mobile scroll.
  const colMinW = cols >= 4 ? "min-w-[200px]" : cols === 3 ? "min-w-[220px]" : "min-w-[240px]";

  const scoreFor = (criterionId: string, productId: string) =>
    scores.find((s) => s.criterion_id === criterionId && s.product_id === productId);

  return (
    <article>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/30 via-background to-background" />
        <Container size="xl" className="pt-14 pb-10">
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">
            Comparison
          </div>
          <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{post.excerpt}</p>
          )}
          {products.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Comparing:</span>
              {products.map((p, i) => (
                <span key={p.id} className="inline-flex items-center gap-2">
                  {i > 0 && <span className="text-border">·</span>}
                  <span className="font-medium text-foreground">{p.name}</span>
                </span>
              ))}
            </div>
          )}
        </Container>
      </section>

      {products.length === 0 ? (
        <Container size="md" className="py-16 text-center text-muted-foreground">
          No products linked to this comparison yet.
        </Container>
      ) : (
        <Container size="xl" className="pb-16">
          {/* MOBILE PRODUCT CARDS (visible only on small screens) */}
          <div className="md:hidden space-y-4 mb-10">
            {products.map((p) => (
              <MobileProductCard key={p.id} product={p} slug={slug} />
            ))}
          </div>

          {/* DESKTOP / TABLET COMPARISON TABLE */}
          <div className="hidden md:block rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: `${cols * 240 + 200}px` }}>
                {/* STICKY HEADER: product cards */}
                <thead className="sticky top-16 z-20 bg-card/95 backdrop-blur border-b border-border/60">
                  <tr>
                    <th className="w-44 text-left p-4 align-top">
                      <span className="sr-only">Criteria</span>
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className={`p-4 align-top text-left ${colMinW}`}>
                        <div className="flex items-center gap-3">
                          {p.logo_url && (
                            <img
                              src={p.logo_url}
                              alt=""
                              loading="lazy"
                              className="size-10 rounded-lg object-contain bg-accent/40 p-1 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <Link
                              to="/review/$slug"
                              params={{ slug: p.slug }}
                              className="font-semibold hover:text-primary truncate block"
                            >
                              {p.name}
                            </Link>
                            {p.vendor && (
                              <p className="text-xs text-muted-foreground truncate">{p.vendor}</p>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="[&_tr:nth-child(even)]:bg-muted/30">
                  {/* Rating */}
                  <Row label="Rating">
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 align-top ${colMinW}`}>
                        {p.rating != null ? (
                          <div>
                            <div className="text-warning leading-none">
                              {stars(Number(p.rating))}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {Number(p.rating).toFixed(1)} / 5
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </Row>

                  {/* Pricing */}
                  <Row label="Pricing">
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 align-top ${colMinW}`}>
                        <div className="font-semibold">
                          {formatPrice(p.starting_price ?? null, p.currency ?? "USD")}
                        </div>
                        {p.pricing_model && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {p.pricing_model}
                          </div>
                        )}
                      </td>
                    ))}
                  </Row>

                  {/* Best for */}
                  <Row label="Best for">
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 align-top text-muted-foreground ${colMinW}`}>
                        {p.best_for || "—"}
                      </td>
                    ))}
                  </Row>

                  {/* Dynamic criteria rows */}
                  {criteria.map((c) => (
                    <Row key={c.id} label={c.label}>
                      {products.map((p) => {
                        const s = scoreFor(c.id, p.id);
                        return (
                          <td key={p.id} className={`p-4 align-top ${colMinW}`}>
                            {s?.score != null && (
                              <div className="font-semibold">{Number(s.score).toFixed(1)}</div>
                            )}
                            {s?.note && (
                              <div className="text-xs text-muted-foreground mt-1">{s.note}</div>
                            )}
                            {!s?.score && !s?.note && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </Row>
                  ))}

                  {/* Pros */}
                  <Row label="Pros">
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 align-top ${colMinW}`}>
                        {p.pros?.length ? (
                          <ul className="space-y-1.5">
                            {p.pros.slice(0, 4).map((pro) => (
                              <li key={pro} className="flex gap-1.5 text-xs">
                                <span className="text-success mt-0.5">✓</span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </Row>

                  {/* Cons */}
                  <Row label="Cons">
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 align-top ${colMinW}`}>
                        {p.cons?.length ? (
                          <ul className="space-y-1.5">
                            {p.cons.slice(0, 4).map((c) => (
                              <li key={c} className="flex gap-1.5 text-xs">
                                <span className="text-destructive mt-0.5">−</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </Row>

                  {/* STICKY CTA ROW */}
                  <tr className="sticky bottom-0 z-10 bg-card/95 backdrop-blur border-t border-border/60">
                    <td className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Get started
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className={`p-4 ${colMinW}`}>
                        <a
                          href={withUtm(p.affiliate_url || p.website_url, slug)}
                          target="_blank"
                          rel="nofollow sponsored noopener"
                          className="w-full inline-flex h-10 items-center justify-center rounded-full bg-primary text-primary-foreground px-4 text-xs font-semibold hover:opacity-90 whitespace-nowrap"
                        >
                          Try {p.name} →
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* DEEP-DIVE CONTENT */}
          {html && (
            <Container size="md" className="mt-16 px-0">
              <div
                className="prose-content text-foreground"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Container>
          )}
        </Container>
      )}
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th
        scope="row"
        className="w-44 text-left p-4 align-top text-xs uppercase tracking-wider text-muted-foreground font-semibold"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function MobileProductCard({ product, slug }: { product: Product; slug: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-start gap-3">
        {product.logo_url && (
          <img
            src={product.logo_url}
            alt=""
            loading="lazy"
            className="size-12 rounded-lg object-contain bg-accent/40 p-1.5 shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <Link
            to="/review/$slug"
            params={{ slug: product.slug }}
            className="font-semibold hover:text-primary"
          >
            {product.name}
          </Link>
          {product.vendor && (
            <p className="text-xs text-muted-foreground">{product.vendor}</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs">
            {product.rating != null && (
              <>
                <span className="text-warning">{stars(Number(product.rating))}</span>
                <span className="text-muted-foreground">{Number(product.rating).toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="uppercase tracking-wider text-muted-foreground">Price</p>
          <p className="mt-0.5 font-semibold text-sm">
            {formatPrice(product.starting_price ?? null, product.currency ?? "USD")}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-muted-foreground">Model</p>
          <p className="mt-0.5 text-sm">{product.pricing_model || "—"}</p>
        </div>
      </div>
      <a
        href={withUtm(product.affiliate_url || product.website_url, slug)}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="mt-4 w-full inline-flex h-11 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
      >
        Try {product.name} →
      </a>
    </div>
  );
}
