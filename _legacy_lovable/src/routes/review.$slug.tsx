import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { getProductReview } from "@/lib/products.functions";
import { renderTiptap } from "@/lib/tiptap-render";
import { formatPrice, stars } from "@/lib/format";
import { SITE_NAME, truncate } from "@/lib/seo";

type RelatedProduct = {
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
};

const DEFAULT_FAQS = (name: string, pricing: string | null, bestFor: string | null) => [
  {
    q: `Is ${name} worth it?`,
    a: `${name} is best for ${bestFor || "teams that need a reliable, well-supported tool"}. Read our full breakdown above to see if it fits your stack.`,
  },
  {
    q: `How much does ${name} cost?`,
    a: pricing
      ? `${name} uses a ${pricing.toLowerCase()} pricing model. See the pricing summary above for the current starting price.`
      : `Pricing varies by plan. Check the official site via the button above for the latest tiers.`,
  },
  {
    q: `Is there a free trial?`,
    a: `Most plans include a free tier or trial period. Follow the affiliate link to start without a credit card where available.`,
  },
];

function withUtm(url: string, slug: string) {
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "stackpilot");
    if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "review");
    if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", slug);
    return u.toString();
  } catch {
    return url;
  }
}

export const Route = createFileRoute("/review/$slug")({
  loader: async ({ params }) => {
    const res = await getProductReview({ data: { slug: params.slug } });
    if (!res.product) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    const title = p?.name ? `${p.name} Review (2026): Pros, Cons, Pricing` : "Review";
    const desc = truncate(p?.short_description || "");
    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/review/${params.slug}` },
        ...(p?.logo_url ? [{ property: "og:image", content: p.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/review/${params.slug}` }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name: p.name,
                description: p.short_description,
                image: p.logo_url || undefined,
                brand: p.vendor ? { "@type": "Brand", name: p.vendor } : undefined,
                ...(p.rating != null
                  ? {
                      aggregateRating: {
                        "@type": "AggregateRating",
                        ratingValue: Number(p.rating),
                        bestRating: 5,
                        ratingCount: 1,
                      },
                    }
                  : {}),
                ...(p.starting_price != null
                  ? {
                      offers: {
                        "@type": "Offer",
                        price: Number(p.starting_price),
                        priceCurrency: p.currency || "USD",
                        url: p.affiliate_url || p.website_url || undefined,
                      },
                    }
                  : {}),
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: DEFAULT_FAQS(p.name, p.pricing_model, p.best_for).map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Review not found</h1>
      <Link to="/tools" className="mt-4 inline-block text-primary hover:underline">
        Browse all tools
      </Link>
    </Container>
  ),
  errorComponent: ({ error, reset }) => {
    return (
      <Container size="md" className="py-24 text-center">
        <h1 className="text-2xl font-semibold">Could not load review</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </Container>
    );
  },
  component: ReviewPage,
});

function ReviewPage() {
  const { product: p, related, category } = Route.useLoaderData();
  const { slug } = Route.useParams();
  if (!p) return null;

  const affiliateHref = withUtm(p.affiliate_url || p.website_url || "#", slug);
  const longHtml = renderTiptap(p.long_description);
  const faqs = DEFAULT_FAQS(p.name, p.pricing_model, p.best_for);

  const [showSticky, setShowSticky] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 via-background to-background" />
        <Container size="lg" className="pt-16 pb-12">
          <nav className="text-xs text-muted-foreground mb-6">
            <Link to="/tools" className="hover:text-foreground">Tools</Link>
            {category?.slug && (
              <>
                <span className="mx-2">/</span>
                <Link
                  to="/categories/$slug"
                  params={{ slug: category.slug }}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </>
            )}
            <span className="mx-2">/</span>
            <span className="text-foreground">{p.name} Review</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
              {p.logo_url && (
                <img
                  src={p.logo_url}
                  alt={`${p.name} logo`}
                  loading="lazy"
                  className="size-24 rounded-2xl object-contain bg-card p-3 border border-border/60 shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                {p.vendor && (
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.vendor}</p>
                )}
                <h1 className="mt-1 text-4xl sm:text-5xl font-semibold tracking-tight">
                  {p.name} Review
                </h1>
                {p.short_description && (
                  <p className="mt-3 text-lg text-muted-foreground max-w-2xl">{p.short_description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {p.rating != null && (
                    <span className="flex items-center gap-2">
                      <span className="text-warning text-base leading-none">{stars(Number(p.rating))}</span>
                      <span className="font-semibold">{Number(p.rating).toFixed(1)}</span>
                      <span className="text-muted-foreground">/ 5</span>
                    </span>
                  )}
                  {p.pricing_model && (
                    <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium">
                      {p.pricing_model}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    From <span className="text-foreground font-semibold">{formatPrice(p.starting_price ?? null, p.currency ?? "USD")}</span>
                  </span>
                </div>
              </div>
            </div>

            <a
              href={affiliateHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="hidden lg:inline-flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground px-7 text-sm font-semibold hover:opacity-90 shadow-[var(--shadow-card)]"
            >
              Try {p.name} →
            </a>
          </div>
        </Container>
      </section>

      <Container size="lg" className="grid lg:grid-cols-3 gap-10 pb-20">
        <div className="lg:col-span-2 space-y-12">
          {/* QUICK SUMMARY */}
          <section className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Quick verdict
            </h2>
            <p className="mt-3 text-lg leading-relaxed">
              {p.short_description ||
                `${p.name} is a solid pick in its category — see the breakdown below for the details that matter.`}
            </p>
            {p.best_for && (
              <p className="mt-4 text-sm">
                <span className="font-semibold">Best for:</span>{" "}
                <span className="text-muted-foreground">{p.best_for}</span>
              </p>
            )}
          </section>

          {/* PROS & CONS */}
          {(p.pros?.length || p.cons?.length) ? (
            <section className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-success">Pros</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {(p.pros ?? []).map((pro: string) => (
                    <li key={pro} className="flex gap-2.5">
                      <span className="text-success mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive">Cons</h2>
                <ul className="mt-4 space-y-3 text-sm">
                  {(p.cons ?? []).map((c: string) => (
                    <li key={c} className="flex gap-2.5">
                      <span className="text-destructive mt-0.5">−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}

          {/* DEEP DIVE */}
          {longHtml && (
            <section
              className="prose-content text-foreground"
              dangerouslySetInnerHTML={{ __html: longHtml }}
            />
          )}

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-border/60 border-y border-border/60">
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between py-5 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-medium">{f.q}</span>
                      <span className="text-muted-foreground text-xl leading-none">{open ? "−" : "+"}</span>
                    </button>
                    {open && <p className="pb-5 -mt-1 text-muted-foreground">{f.a}</p>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* COMPARISON SUGGESTIONS */}
          {related.length > 0 && (
            <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-accent/30 to-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold">Compare {p.name} with alternatives</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Weighing options? See how {p.name} stacks up against the top competitors.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {related.slice(0, 3).map((r: RelatedProduct) => (
                  <Link
                    key={r.id}
                    to="/compare"
                    className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                  >
                    {p.name} vs {r.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Pricing</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatPrice(p.starting_price ?? null, p.currency ?? "USD")}
            </p>
            {p.pricing_model && (
              <p className="text-xs text-muted-foreground mt-1">{p.pricing_model}</p>
            )}
            <hr className="my-5 border-border/60" />
            {p.rating != null && (
              <>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Our rating</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{Number(p.rating).toFixed(1)}</span>
                  <span className="text-warning">{stars(Number(p.rating))}</span>
                </p>
                <hr className="my-5 border-border/60" />
              </>
            )}
            {p.best_for && (
              <>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Best for</p>
                <p className="mt-1 text-sm">{p.best_for}</p>
                <hr className="my-5 border-border/60" />
              </>
            )}
            <a
              href={affiliateHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="w-full inline-flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 shadow-[var(--shadow-card)]"
            >
              Try {p.name} →
            </a>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">
              Affiliate link — at no extra cost to you.
            </p>
          </div>
        </aside>
      </Container>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="border-t border-border/60 bg-accent/20">
          <Container size="lg" className="py-16">
            <h2 className="text-2xl font-semibold tracking-tight">Related tools</h2>
            <p className="mt-2 text-muted-foreground">More options in this category.</p>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r: RelatedProduct) => (
                <Link
                  key={r.id}
                  to="/review/$slug"
                  params={{ slug: r.slug }}
                  className="group rounded-2xl border border-border/60 bg-card p-5 hover:shadow-[var(--shadow-card)] transition"
                >
                  <div className="flex items-center gap-3">
                    {r.logo_url && (
                      <img
                        src={r.logo_url}
                        alt=""
                        loading="lazy"
                        className="size-10 rounded-lg object-contain bg-accent/40 p-1"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate group-hover:text-primary">{r.name}</p>
                      {r.rating != null && (
                        <p className="text-xs text-warning">{stars(Number(r.rating))}</p>
                      )}
                    </div>
                  </div>
                  {r.short_description && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {r.short_description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    From{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(r.starting_price ?? null, r.currency ?? "USD")}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* STICKY CTA */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur transition-transform duration-300 ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <Container size="lg" className="py-3 flex items-center gap-4">
          {p.logo_url && (
            <img src={p.logo_url} alt="" className="size-10 rounded-lg object-contain bg-accent/40 p-1 hidden sm:block" loading="lazy" decoding="async" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{p.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              From {formatPrice(p.starting_price ?? null, p.currency ?? "USD")}
              {p.rating != null && <> · {Number(p.rating).toFixed(1)} ★</>}
            </p>
          </div>
          <a
            href={affiliateHref}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary text-primary-foreground px-5 text-sm font-semibold hover:opacity-90 whitespace-nowrap"
          >
            Try {p.name} →
          </a>
        </Container>
      </div>
    </>
  );
}
