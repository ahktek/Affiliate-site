import { createFileRoute, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { listProducts } from "@/lib/products.functions";
import { formatPrice } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/tools")({
  loader: async () => {
    const { products } = await listProducts({ data: { limit: 100 } });
    return { products };
  },
  head: () => ({
    meta: [
      { title: `AI tools directory — ${SITE_NAME}` },
      { name: "description", content: "A curated directory of AI tools and SaaS — pricing, ratings, and what each is best for." },
      { property: "og:title", content: `AI tools directory — ${SITE_NAME}` },
      { property: "og:description", content: "Browse every AI tool we've tested with ratings, pricing and one-line verdicts." },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const { products } = Route.useLoaderData();
  return (
    <Container size="xl" className="py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Tools directory</h1>
        <p className="mt-3 text-muted-foreground">{products.length} AI tools, rated and ranked.</p>
      </header>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p: any) => (
          <Link
            key={p.id}
            to="/tools/$slug"
            params={{ slug: p.slug }}
            className="group rounded-2xl border border-border/60 bg-surface p-5 hover:shadow-[var(--shadow-card)] transition"
          >
            <div className="flex items-start gap-4">
              {p.logo_url ? (
                <img src={p.logo_url} alt="" className="size-12 rounded-lg object-contain bg-accent/40 p-1" loading="lazy" />
              ) : (
                <div className="size-12 rounded-lg bg-accent" />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold leading-tight group-hover:text-primary transition-colors">{p.name}</h2>
                {p.vendor && <p className="text-xs text-muted-foreground mt-0.5">{p.vendor}</p>}
              </div>
              {p.rating != null && (
                <div className="text-sm font-semibold text-foreground">{Number(p.rating).toFixed(1)}</div>
              )}
            </div>
            {p.short_description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>
            )}
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{p.pricing_model ?? ""}</span>
              <span className="font-medium">{formatPrice(p.starting_price ?? null, p.currency ?? "USD")}</span>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
