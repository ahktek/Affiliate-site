import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ComparisonTable from "@/components/ComparisonTable";
import { BookOpen, Star, ArrowRight, Layers, PenTool } from "lucide-react";

export const revalidate = 3600;

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("categories").select("slug");
    return (data || []).map((c: any) => ({
      slug: c.slug,
    }));
  } catch (err) {
    console.error("Error generating static params for categories:", err);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!category) {
    return {
      title: "Category Not Found | Optura Vibe",
    };
  }

  return {
    title: `Best ${category.name} of ${new Date().getFullYear()} | Optura Vibe`,
    description: category.description || `Read expert reviews and detailed matchups for the top ${category.name}.`,
  };
}

export default async function CategoryLandingPage({ params }: CategoryPageProps) {
  // 1. Fetch Category Details
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!category) {
    notFound();
  }

  // 2. Fetch all reviews in this category (newest first)
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*, categories(name, slug)")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // 3. Fetch all posts in this category (newest first)
  const { data: postsData } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // 4. Map the category slug to tool categories text filter
  const categoryToToolMap: Record<string, string[]> = {
    "ai-code-assistants": ["Coding"],
    "ai-image-generators": ["Image Gen", "Video", "Audio"],
    "ai-writing-assistants": ["Writing"],
    "ai-chatbots": ["Research", "Productivity", "Other"],
  };
  const targetToolCategories = categoryToToolMap[category.slug] || ["Coding", "Writing", "Image Gen", "Video", "Audio", "Productivity", "Research", "Other"];

  // Fetch tools matching mapped category text strings
  const { data: toolsData } = await supabase
    .from("ai_tools")
    .select("*")
    .in("category", targetToolCategories)
    .eq("status", "published")
    .order("overall_score", { ascending: false });

  const reviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || "Our detailed analysis breaks down performance, design, and ease-of-use.",
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: r.categories?.name || "Uncategorized",
    categorySlug: r.categories?.slug || "",
    overallRating: (Number(r.overall_rating) || 0) * 2, // Map 1-5 to 1-10
    scores: r.scores || {},
    ctaLinks: r.cta_links || [],
    createdAt: new Date(r.created_at).getTime(),
  }));

  const posts = (postsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "Read our latest column for strategies, industry news, and product reviews.",
    featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: p.categories?.name || "Uncategorized",
    categorySlug: p.categories?.slug || "",
    createdAt: new Date(p.created_at).getTime(),
  }));

  // Matchup Table Data preparation: Convert reviews list to Product interface format
  const matchupReviews = reviews.slice(0, 4);

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://opturavibe.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Categories",
        "item": "https://opturavibe.com/reviews"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://opturavibe.com/category/${category.slug}`
      }
    ]
  };

  // Collection Page Schema
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Top ${category.name} Matchups & Reviews`,
    "description": category.description || "",
    "url": `https://opturavibe.com/category/${category.slug}`,
    "about": {
      "@type": "Thing",
      "name": category.name
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": reviews.map((r, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://opturavibe.com/reviews/${r.slug}`
      }))
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Script
        id="category-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="category-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20">
        
        {/* Category Header */}
        <header className="max-w-[720px] mb-16 space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block">
            Category Hub
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-foreground">
            {category.name}
          </h1>
          {category.description && (
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}
        </header>

        {/* Side-by-Side Matchups Table */}
        {matchupReviews.length >= 2 && (
          <section className="mb-20">
            <ComparisonTable
              currentProduct={matchupReviews[0]}
              comparisonProducts={matchupReviews.slice(1)}
              hideCurrentBadge={true}
            />
          </section>
        )}

        {/* Reviews Grid */}
        <section className="space-y-8 mb-20">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              <span>Latest Product Reviews</span>
            </h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-secondary/35 border border-border border-dashed rounded-[6px]">
              <p className="font-body text-sm text-muted-foreground">No hands-on reviews published in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => {
                const mainCta = review.ctaLinks?.[0] || { label: "Check Price", url: `/reviews/${review.slug}` };
                return (
                  <article
                    key={review.id}
                    className="bg-card border border-border rounded-[6px] overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group h-full"
                  >
                    <div className="space-y-4">
                      {/* Image Block */}
                      <Link href={`/reviews/${review.slug}`} className="relative aspect-[16/10] overflow-hidden bg-secondary block">
                        <Image
                          src={review.featuredImage}
                          alt={review.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <span className="absolute bottom-4 left-4 font-sans text-[0.65rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px]">
                          {review.category}
                        </span>
                      </Link>

                      {/* Content block */}
                      <div className="px-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <div className="flex items-center gap-0.5 font-sans text-[0.7rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[4px]">
                            <Star size={10} className="fill-current" />
                            <span>{review.overallRating.toFixed(1)}</span>
                          </div>
                        </div>

                        <h3 className="font-display font-semibold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          <Link href={`/reviews/${review.slug}`}>{review.title} Review</Link>
                        </h3>

                        <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {review.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="p-6 pt-4 flex items-center justify-between border-t border-border/60 mt-6">
                      <Link
                        href={`/reviews/${review.slug}`}
                        className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        <span>Read Review</span>
                        <ArrowRight size={11} />
                      </Link>

                      <a
                        href={`/go/${review.slug}`}
                        target="_blank"
                        rel="sponsored noopener"
                        className="font-sans text-[11px] font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-[4px] hover:bg-accent-hover transition-colors shadow-sm"
                      >
                        {mainCta.label}
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Related Posts Grid */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <span>Related Editorial Columns & Guides</span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-secondary/35 border border-border border-dashed rounded-[6px]">
              <p className="font-body text-sm text-muted-foreground">No posts published in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-card border border-border rounded-[6px] overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col group h-full"
                >
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-secondary block">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <span className="absolute bottom-4 left-4 font-sans text-[0.65rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px]">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <h3 className="font-display font-semibold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        <span>Read Article</span>
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
