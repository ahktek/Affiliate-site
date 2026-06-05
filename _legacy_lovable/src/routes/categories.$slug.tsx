import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { listProducts } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { formatPrice } from "@/lib/format";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/categories/$slug")({
  loader: async ({ params }) => {
    const [{ categories }, { products }] = await Promise.all([
      listCategories(),
      listProducts({ data: { categorySlug: params.slug, limit: 100 } }),
    ]);
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category, products };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.category;
    const title = c ? `${c.name} — AI tools` : "Category";
    const desc = c?.description || `AI tools for ${c?.name ?? params.slug}.`;
    return {
      meta: [
        { title: `${title} — ${SITE_NAME}` },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `/categories/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/categories/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <Container size="md" className="py-24 text-center">
      <h1 className="text-2xl font-semibold">Category not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary hover:underline">Home</Link>
    </Container>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  return (
    <Container size="xl" className="py-16">
      <header className="max-w-2xl">
        <div className="text-3xl">{category.icon ?? "✨"}</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{category.name}</h1>
        {category.description && <p className="mt-3 text-muted-foreground">{category.description}</p>}
      </header>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 && <p className="text-muted-foreground">No tools in this category yet.</p>}
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
              {p.rating != null && <div className="text-sm font-semibold">{Number(p.rating).toFixed(1)}</div>}
            </div>
            {p.short_description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.short_description}</p>}
            <div className="mt-4 text-xs font-medium">{formatPrice(p.starting_price ?? null, p.currency ?? "USD")}</div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
