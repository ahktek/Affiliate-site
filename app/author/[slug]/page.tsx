import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Twitter, Linkedin, Globe, Star, ArrowRight, BookOpen, MessageSquare } from "lucide-react";

export const revalidate = 3600;

interface AuthorPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from("authors").select("slug");
    return (data || []).map((a: any) => ({
      slug: a.slug,
    }));
  } catch (err) {
    console.error("Error generating static params for authors:", err);
    return [];
  }
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { data: author } = await supabase
    .from("authors")
    .select("display_name, title, bio")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!author) {
    return {
      title: "Author Not Found | Chronicle",
    };
  }

  return {
    title: `${author.display_name} - ${author.title || "Contributor"} | Chronicle`,
    description: author.bio || `Read articles and reviews written by ${author.display_name} on Chronicle.`,
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  // 1. Fetch Author Details
  const { data: author } = await supabase
    .from("authors")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!author) {
    notFound();
  }

  // 2. Fetch Reviews written by Author
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("author_id", author.id)
    .eq("status", "published");

  // 3. Fetch Posts written by Author
  const { data: postsData } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("author_id", author.id)
    .eq("status", "published");

  // Combine and sort (newest first)
  const reviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    type: "review" as const,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || "Read our full analysis breaks down performance, design, and ease-of-use.",
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: r.categories?.name || "Uncategorized",
    overallRating: (Number(r.overall_rating) || 0) * 2, // Map 1-5 to 1-10
    createdAt: new Date(r.created_at).getTime(),
  }));

  const posts = (postsData || []).map((p: any) => ({
    id: p.id,
    type: "post" as const,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "Read our latest column for strategies, industry news, and product reviews.",
    featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: p.categories?.name || "Uncategorized",
    overallRating: undefined,
    createdAt: new Date(p.created_at).getTime(),
  }));

  const articles = [...reviews, ...posts].sort((a, b) => b.createdAt - a.createdAt);

  // Schema.org Person JSON-LD
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.display_name,
    "jobTitle": author.title || undefined,
    "description": author.bio || undefined,
    "image": author.avatar_url || undefined,
    "sameAs": [
      author.twitter_url,
      author.linkedin_url,
      author.website_url
    ].filter(Boolean)
  };

  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://chronicle.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Authors",
        "item": "https://chronicle.com/authors"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": author.display_name,
        "item": `https://chronicle.com/author/${author.slug}`
      }
    ]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Script
        id="author-person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Script
        id="author-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20">
        
        {/* Author Bio Header Card */}
        <section className="bg-card border border-border rounded-[8px] p-8 md:p-12 mb-16 relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Avatar image */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shrink-0 bg-secondary border border-border">
              <Image
                src={author.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"}
                alt={author.display_name}
                fill
                priority
                sizes="(max-width: 768px) 96px, 128px"
                className="object-cover"
              />
            </div>

            {/* Author info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                    {author.display_name}
                  </h1>
                  
                  {author.title && (
                    <span className="font-sans text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-[4px]">
                      {author.title}
                    </span>
                  )}
                </div>

                {author.credentials && (
                  <p className="font-sans text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {author.credentials}
                  </p>
                )}
              </div>

              {author.bio ? (
                <p className="font-body text-base text-muted-foreground leading-relaxed max-w-3xl">
                  {author.bio}
                </p>
              ) : (
                <p className="font-body text-base text-muted-foreground/60 italic leading-relaxed max-w-3xl">
                  No biography provided.
                </p>
              )}

              {/* Social Links */}
              {(author.twitter_url || author.linkedin_url || author.website_url) && (
                <div className="flex items-center gap-3 pt-2">
                  {author.twitter_url && (
                    <a
                      href={author.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="p-2 border border-border rounded-[6px] hover:bg-secondary hover:text-primary transition-all duration-200"
                      title="Twitter / X Profile"
                    >
                      <Twitter size={16} />
                    </a>
                  )}

                  {author.linkedin_url && (
                    <a
                      href={author.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="p-2 border border-border rounded-[6px] hover:bg-secondary hover:text-primary transition-all duration-200"
                      title="LinkedIn Profile"
                    >
                      <Linkedin size={16} />
                    </a>
                  )}

                  {author.website_url && (
                    <a
                      href={author.website_url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="p-2 border border-border rounded-[6px] hover:bg-secondary hover:text-primary transition-all duration-200"
                      title="Personal Website"
                    >
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Written Work Section */}
        <section className="space-y-8">
          <div className="border-b border-border pb-4">
            <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <span>Published Editorial Work ({articles.length})</span>
            </h2>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 bg-secondary/50 border border-border border-dashed rounded-[6px]">
              <p className="font-body text-muted-foreground">No published work found for this author.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((item) => {
                const isReview = item.type === "review";
                const itemLink = isReview ? `/reviews/${item.slug}` : `/blog/${item.slug}`;

                return (
                  <article
                    key={item.id}
                    className="bg-card border border-border rounded-[6px] overflow-hidden hover:border-primary/40 transition-all duration-300 flex flex-col group"
                  >
                    {/* Featured Image */}
                    <Link href={itemLink} className="relative aspect-[16/10] overflow-hidden bg-secondary block">
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                      <span className="absolute bottom-4 left-4 font-sans text-[0.65rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px]">
                        {item.category}
                      </span>
                    </Link>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Meta row */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>

                          {isReview && item.overallRating !== undefined && (
                            <div className="flex items-center gap-0.5 font-sans text-[0.7rem] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[4px]">
                              <Star size={10} className="fill-current" />
                              <span>{item.overallRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-semibold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          <Link href={itemLink}>{item.title}</Link>
                        </h3>

                        {/* Excerpt */}
                        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>

                      {/* Read link */}
                      <div className="pt-2">
                        <Link
                          href={itemLink}
                          className="inline-flex items-center gap-1 font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          <span>{isReview ? "Read Review" : "Read Article"}</span>
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
