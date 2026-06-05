import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { getProductBySlug } from "@/lib/products.functions";
import { renderTiptap } from "@/lib/tiptap-render";
import { formatPrice, stars } from "@/lib/format";
import { SITE_NAME, truncate } from "@/lib/seo";

export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ params }) => {
    const { product } = await getProductBySlug({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.product;
    const title = p?.name ? `${p.name} review` : "Tool";
    const desc = truncate(p?.short_description || "");
    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/tools/${params.slug}` },
        ...(p?.logo_url ? [{ property: "og:image", content: p.logo_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/tools/${params.slug}` }],
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
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Tool not found</h1>
      <Link to="/tools" className="mt-4 inline-block text-primary hover:underline">All tools</Link>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Could not load tool</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </Container>
  ),
  component: ToolPage,
});

function ToolPage() {
  const { product: p } = Route.useLoaderData();
  if (!p) return null;
  const longHtml = renderTiptap(p.long_description);
  const affiliateHref = p.affiliate_url || p.website_url || "#";

  return (
    <>
      <Container size="lg" className="pt-16">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          {p.logo_url && (
            <img src={p.logo_url} alt="" className="size-20 rounded-2xl object-contain bg-accent/40 p-2" loading="eager" fetchPriority="high" decoding="async" />
          )}
          <div className="flex-1">
            {p.vendor && <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.vendor}</p>}
            <h1 className="mt-1 text-4xl font-semibold tracking-tight">{p.name}</h1>
            {p.short_description && <p className="mt-2 text-muted-foreground max-w-2xl">{p.short_description}</p>}
            <div className="mt-3 flex items-center gap-4 text-sm">
              {p.rating != null && (
                <span className="flex items-center gap-1.5">
                  <span className="text-warning">{stars(Number(p.rating))}</span>
                  <span className="font-medium">{Number(p.rating).toFixed(1)}</span>
                </span>
              )}
              {p.pricing_model && <span className="text-muted-foreground">{p.pricing_model}</span>}
              <span className="font-medium">{formatPrice(p.starting_price ?? null, p.currency ?? "USD")}</span>
            </div>
          </div>
          <a
            href={affiliateHref}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary text-primary-foreground px-6 text-sm font-medium hover:opacity-90 shadow-[var(--shadow-card)]"
          >
            Visit {p.name} →
          </a>
        </div>
      </Container>

      <Container size="lg" className="mt-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {longHtml && (
            <section className="prose-content text-foreground" dangerouslySetInnerHTML={{ __html: longHtml }} />
          )}

          {(p.pros?.length || p.cons?.length) ? (
            <section className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/60 bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-success">Pros</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {(p.pros ?? []).map((pro: string) => (
                    <li key={pro} className="flex gap-2"><span className="text-success">✓</span><span>{pro}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-destructive">Cons</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {(p.cons ?? []).map((c: string) => (
                    <li key={c} className="flex gap-2"><span className="text-destructive">−</span><span>{c}</span></li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-surface p-6 sticky top-24">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Best for</p>
            <p className="mt-1 text-sm">{p.best_for ?? "General use"}</p>
            <hr className="my-4 border-border/60" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Starts at</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(p.starting_price ?? null, p.currency ?? "USD")}</p>
            <a
              href={affiliateHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="mt-5 w-full inline-flex h-11 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Try {p.name}
            </a>
            <p className="mt-3 text-[11px] text-muted-foreground text-center">Affiliate link — at no extra cost to you.</p>
          </div>
        </aside>
      </Container>
    </>
  );
}
