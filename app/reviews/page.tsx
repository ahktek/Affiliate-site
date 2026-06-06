import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, ExternalLink, ArrowRight } from "lucide-react";

export const revalidate = 3600;

export const metadata = {
  title: "Product Reviews | AI Tools & SaaS | Chronicle",
  description: "Read our comprehensive, hands-on reviews of the top AI tools and SaaS products.",
};

export default async function ReviewsListingPage() {
  const { data } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
    
  const reviews = (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    content: r.content,
    excerpt: r.excerpt,
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: r.categories?.name || "Uncategorized",
    overallRating: (Number(r.overall_rating) || 0) * 2,
    scores: r.scores,
    pros: r.pros,
    cons: r.cons,
    ctaLinks: r.cta_links,
    compareWith: r.compare_with,
    status: r.status,
    authorId: r.author_id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));

  const getVerdictText = (score: number) => {
    if (score >= 8.5) return "An exceptional industry leader.";
    if (score >= 7.0) return "Highly recommended, excellent value.";
    if (score >= 5.0) return "A solid choice with minor drawbacks.";
    return "Not recommended under current testing.";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20">
        
        {/* Page Header */}
        <div className="max-w-[680px] mb-12 md:mb-16 space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block">
            THE RATINGS DATABASE
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-foreground">
            Product Reviews
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Every product we review is subjected to hands-on testing, feature assessment, and scoring models. No promotional sponsorships affect our ratings.
          </p>
        </div>

        {/* Listings - Variant C Cards stack */}
        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-secondary border border-border rounded-[6px]">
            <p className="font-body text-muted-foreground">No review articles published yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => {
              const mainCta = review.ctaLinks?.[0] || { label: "Check Price", url: `/reviews/${review.slug}` };
              return (
                <article
                  key={review.id}
                  className="bg-card border border-border rounded-[6px] p-6 hover:border-primary/40 transition-all duration-300 flex flex-col md:flex-row gap-6 items-stretch"
                >
                  {/* Left Column: Fixed 160px Image (on desktop) */}
                  <div className="relative w-full md:w-[160px] h-[160px] md:h-auto shrink-0 bg-secondary rounded-[4px] overflow-hidden group">
                    <Image
                      src={review.featuredImage}
                      alt={review.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  {/* Middle/Main Column: Title, Category, Verdict Snippet */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
                          {review.category}
                        </span>
                        <span className="text-muted-foreground font-mono text-[0.75rem]">•</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          Published {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      
                      <h3 className="font-display font-semibold text-xl md:text-2xl text-foreground hover:text-primary transition-colors leading-tight">
                        <Link href={`/reviews/${review.slug}`}>
                          {review.title}
                        </Link>
                      </h3>
                      
                      <p className="font-body italic text-[0.95rem] text-muted-foreground leading-relaxed">
                        &ldquo;{getVerdictText(review.overallRating)} {review.excerpt || "Our full analysis breaks down performance, design, and ease-of-use."}&rdquo;
                      </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={`/reviews/${review.slug}`}
                        className="font-sans text-xs font-semibold px-4 py-2 border border-border-emphasis rounded-[6px] hover:bg-secondary transition-all"
                      >
                        Read Review
                      </Link>
                      <a
                        href={mainCta.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="bg-primary text-primary-foreground font-sans text-xs font-semibold px-4 py-2 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{mainCta.label}</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Score badge (desktop) */}
                  <div className="flex md:flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-8 shrink-0 min-w-[100px]">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-16 h-16 rounded-full border-2 border-primary flex flex-col items-center justify-center bg-accent-light">
                        <span className="font-display font-bold text-lg text-primary select-none mt-0.5">
                          {review.overallRating.toFixed(1)}
                        </span>
                      </div>
                      <span className="font-sans text-[0.6rem] text-muted-foreground uppercase tracking-widest block text-center mt-1">
                        SCORE
                      </span>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
