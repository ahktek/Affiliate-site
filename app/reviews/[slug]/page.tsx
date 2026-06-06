import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import Link from "next/link";
import { Check, X, Star, ExternalLink, ArrowRight, Database, Award, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) return { title: "Review Not Found" };
  
  return {
    title: `${data.meta_title || data.title} Review (${new Date().getFullYear()}) | AI Reviews`,
    description: data.meta_description || data.excerpt,
  };
}

export default async function SingleReviewPage({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) notFound();
  
  const review = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    featuredImage: data.featured_image,
    category: data.categories?.name || "",
    overallRating: Number(data.overall_rating) || 0,
    scores: data.scores || {},
    pros: data.pros || [],
    cons: data.cons || [],
    ctaLinks: data.cta_links || [],
    compareWith: data.compare_with || [],
    status: data.status,
    authorId: data.author_id,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    metaTitle: data.meta_title || "",
    metaDescription: data.meta_description || "",
  };

  // JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": review.title,
    "description": review.excerpt || review.metaDescription,
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.overallRating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Organization",
        "name": "AI Reviews"
      }
    }
  };

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

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Script
            id="product-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-16 border-b border-dashed border-border/60 pb-12">
            <div className="md:col-span-7 space-y-6 text-left">
              <span className="tape-label text-[10px] font-mono text-neutral-800 px-3 py-1 uppercase tracking-widest inline-block shadow-sm">
                DIAGNOSTIC REPORT // {review.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold font-mono tracking-tight uppercase leading-none text-foreground">
                {review.title} <span className="text-primary">REVIEW</span>
              </h1>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed">
                {review.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/45 border border-amber-300/40 px-4 py-2 rounded-xl shadow-recessed">
                  <span className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">{review.overallRating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.overallRating ? 'text-amber-500 fill-current' : 'text-neutral-300 dark:text-neutral-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span>EDITOR'S GRADE: PASS</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {review.ctaLinks?.map((cta: any, i: number) => (
                  <Button key={i} size="lg" className="h-12 px-8" asChild>
                    <a href={cta.url} target="_blank" rel="noopener noreferrer nofollow">
                      {cta.label} <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-5 w-full flex justify-center">
              <div className="w-full max-w-[380px] h-72 rounded-2xl overflow-hidden relative border border-border/80 shadow-floating">
                {review.featuredImage ? (
                  <Image src={review.featuredImage} alt={review.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 blueprint-grid bg-slate-900 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent" />
                    <span className="font-mono text-[10px] tracking-wider text-sky-500/40 uppercase absolute top-4 left-4">SCHEMATIC // SPEC_VIEW</span>
                    <div className="w-20 h-20 rounded-full border border-dashed border-sky-500/20 flex items-center justify-center animate-spin-slow">
                      <div className="w-14 h-14 rounded-full border border-sky-500/30 flex items-center justify-center">
                        <Database className="w-6 h-6 text-sky-400/40" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12 text-left">
              <Card className="p-8 md:p-10">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block mb-4 border-b border-dashed border-border/60 pb-2">
                  SECTOR_01 // TEXTUAL_ANALYSIS
                </span>
                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none font-sans text-sm md:text-base leading-relaxed
                    prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-wider prose-headings:font-bold
                    prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-3 prose-h2:mt-8
                    prose-a:text-primary prose-a:underline prose-a:decoration-dashed
                    prose-code:font-mono prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />
              </Card>

              {/* Verdict Box */}
              <Card className="relative overflow-hidden p-8 md:p-10 bg-muted/30 border border-border/80 shadow-recessed">
                {/* top orange striped boundary */}
                <div className="absolute top-0 left-0 right-0 h-1.5 opacity-80" style={{ backgroundImage: "linear-gradient(45deg, #ff4757 25%, #2d3436 25%, #2d3436 50%, #ff4757 50%, #ff4757 75%, #2d3436 75%, #2d3436)", backgroundSize: "12px 12px" }} />
                
                <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1.5 mb-4">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  OFFICIAL DIAGNOSTIC VERDICT // SPEC_MET_OK
                </span>
                <h3 className="text-xl font-bold font-mono uppercase tracking-wider text-foreground mb-4">CONCLUSION_LOG</h3>
                <p className="text-sm text-muted-foreground font-sans mb-6 leading-relaxed">
                  {review.title} is a highly optimal choice for modern automated environments. 
                  With a verified score of {review.overallRating.toFixed(1)}/5.0, it demonstrates top-tier structural efficiency in the {review.category} software segment.
                </p>
                {review.ctaLinks?.[0] && (
                  <Button asChild size="lg">
                    <a href={review.ctaLinks[0].url} target="_blank" rel="noopener noreferrer nofollow">
                      DEPLOY {review.title} INSTANCE <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8 text-left">
              {/* Score Breakdown */}
              <Card className="p-6">
                <span className="text-[9px] font-mono text-muted-foreground uppercase block mb-3 border-b border-dashed border-border/60 pb-2">
                  SECTOR_02 // RAW_BENCHMARKS
                </span>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground mb-6">METER_INDICES</h3>
                <div className="space-y-6">
                  {[
                    { label: "Performance", score: review.scores?.performance || 0 },
                    { label: "Value", score: review.scores?.value || 0 },
                    { label: "Design", score: review.scores?.design || 0 },
                    { label: "Ease of Use", score: review.scores?.easeOfUse || 0 }
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-muted-foreground uppercase">{item.label}</span>
                        <span className="font-bold text-foreground">{item.score.toFixed(1)}/10.0</span>
                      </div>
                      <Progress value={item.score * 10} className="h-5" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Pros & Cons stamp sheets */}
              <div className="grid grid-cols-1 gap-6 font-mono text-xs">
                {/* Pros Stamp Sheet */}
                <div className="border-2 border-dashed border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-10 rotate-12 shrink-0 pointer-events-none">
                    <Check className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h3 className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-4 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> PROS // MATCH_VERIFIED
                  </h3>
                  <ul className="space-y-3 font-sans text-xs">
                    {review.pros?.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 mr-2 shrink-0">[+]</span>
                        <span className="text-muted-foreground">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons Stamp Sheet */}
                <div className="border-2 border-dashed border-primary/40 bg-primary/5 p-6 rounded-xl relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-10 rotate-12 shrink-0 pointer-events-none">
                    <ShieldAlert className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-bold uppercase tracking-wider text-primary mb-4 flex items-center">
                    <X className="w-4 h-4 mr-2 text-primary shrink-0" /> CONS // FAULTS_LOGGED
                  </h3>
                  <ul className="space-y-3 font-sans text-xs">
                    {review.cons?.map((con: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="font-mono text-primary mr-2 shrink-0">[-]</span>
                        <span className="text-muted-foreground">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
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
