import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Database } from "lucide-react";
import Image from "next/image";

export const revalidate = 3600;

export const metadata = {
  title: "Product Reviews | AI Tools & SaaS",
  description: "Read our comprehensive reviews of the top AI tools and SaaS products.",
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
    featuredImage: r.featured_image,
    category: r.categories?.name || "",
    overallRating: Number(r.overall_rating) || 0,
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

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-6xl">
          <Link href="/" className="font-mono font-bold text-lg tracking-wider text-foreground flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-led-pulse" />
            AI_INDEX<span className="text-primary">.SYS</span>
          </Link>
          <nav className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-wider">
            <Link href="/category/ai-writing" className="text-muted-foreground hover:text-foreground transition-colors">AI WRITING</Link>
            <Link href="/category/seo" className="text-muted-foreground hover:text-foreground transition-colors">SEO TOOLS</Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">BLOG</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <Link href="/search">SEARCH</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/login">ADMIN</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Main Title section styled as system documentation header */}
          <div className="border-b border-dashed border-border/60 pb-8 mb-12 text-left">
            <span className="tape-label text-[10px] font-mono text-neutral-800 px-3 py-1 uppercase tracking-widest inline-block mb-3 shadow-sm">
              DATABASE SECTOR // BENCHMARK_DIAGNOSTICS
            </span>
            <h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground mb-3">PRODUCT DIAGNOSTICS</h1>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              Standardized mechanical performance metrics, raw hardware test logs, and pricing-efficiency diagnostic files.
            </p>
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center py-20 border-0 shadow-recessed rounded-2xl bg-muted/50 flex flex-col items-center justify-center p-8">
              <Database className="w-12 h-12 text-muted-foreground/40 mb-3 animate-pulse" />
              <p className="text-sm font-mono text-muted-foreground">NO MODULE DIAGNOSTICS DETECTED ON DB_SECTOR_0</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review: any) => (
                <Card key={review.id} className="flex flex-col hover:-translate-y-1 hover:shadow-floating transition-all duration-300 group">
                  <div className="h-44 rounded-t-2xl overflow-hidden relative">
                    {review.featuredImage ? (
                      <Image 
                        src={review.featuredImage} 
                        alt={review.title} 
                        fill 
                        className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0" 
                      />
                    ) : (
                      <div className="absolute inset-0 blueprint-grid bg-slate-900 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent" />
                        <span className="font-mono text-[9px] tracking-wider text-sky-500/40 uppercase absolute top-3 left-3">MODEL // SPEC_VIEW</span>
                        <div className="w-14 h-14 rounded-full border border-dashed border-sky-500/20 flex items-center justify-center animate-spin-slow">
                          <div className="w-9 h-9 rounded-full border border-sky-500/30 flex items-center justify-center">
                            <Star className="w-4 h-4 text-sky-400/40" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardHeader className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="tape-label text-[9px] font-mono text-neutral-800 px-2 py-0.5 uppercase tracking-wider inline-block">
                        {review.category}
                      </span>
                      <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300/40 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                        <Star className="w-3 h-3 fill-current" /> {review.overallRating.toFixed(1)}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1 text-base">
                      <Link href={`/reviews/${review.slug}`} className="hover:text-primary transition-colors">
                        {review.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-sans">
                      {review.excerpt || review.metaDescription}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 pb-6">
                    <Button className="w-full" asChild variant="secondary">
                      <Link href={`/reviews/${review.slug}`}>OPEN MODULE REPORT</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-12 bg-muted/30 font-mono text-xs mt-12">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <span className="font-bold text-sm tracking-widest text-foreground">AI_INDEX<span className="text-primary">.SYS</span></span>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-sans">
              Empowering mechanical and automated business environments with optimal SaaS configurations.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] text-muted-foreground font-mono">GLOBAL MONITOR: SECURE</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground tracking-wider">SECTORS</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/category/ai-writing" className="hover:text-foreground">AI_WRITING</Link></li>
              <li><Link href="/category/seo" className="hover:text-foreground">SEO_TOOLS</Link></li>
              <li><Link href="/category/marketing" className="hover:text-foreground">MARKETING</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-foreground tracking-wider">LEGAL_REQS</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">PRIVACY_POLICY</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">TERMS_OF_SERVICE</Link></li>
              <li><Link href="/disclaimer" className="hover:text-foreground">AFFILIATE_DISC</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 max-w-6xl mt-12 pt-8 border-t border-border/50 text-[10px] text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AI_INDEX.SYS. ALL SYSTEM RIGHTS MAINTAINED.</p>
          <p className="text-right max-w-md font-sans text-[10px] leading-relaxed">
            AFFILIATE DISCLAIMER: Operations on this network contain referral pointers. A micro-credit may be routed to our console nodes on transaction completion.
          </p>
        </div>
      </footer>
    </div>
  );
}
