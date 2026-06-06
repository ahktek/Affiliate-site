import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Star, Cpu, Database, Settings, Sliders, Activity } from "lucide-react";
import Image from "next/image";

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  // Fetch featured reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
  
  const reviews = (reviewsData || []).map((r: any) => ({
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

  // Fetch recent posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);
    
  const posts = (postsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt,
    featuredImage: p.featured_image,
    category: p.categories?.name || "",
    tags: p.tags,
    status: p.status,
    authorId: p.author_id,
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
    views: p.views,
  }));

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md shadow-card">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 blueprint-grid bg-background/40 border-b border-border/60">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and info */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="tape-label text-xs font-mono text-neutral-800 px-3 py-1 uppercase tracking-widest inline-block shadow-sm">
                  OPERATIONAL MANUAL // DEPLOYMENT_ACTIVE
                </span>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground uppercase font-mono leading-[1.1]">
                  Precision reviews for <span className="text-primary underline decoration-2 decoration-dashed underline-offset-8">AI workflows</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl font-sans leading-relaxed">
                  Deep engineering analysis, raw side-by-side benchmark diagnostics, and modular comparisons to help you select the ideal SaaS chassis for your business stack.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <Button size="lg" className="h-12 px-8" asChild>
                    <Link href="#top-picks">
                      RUN DIAGNOSTICS <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                    <Link href="/blog">BROWSE ARCHIVES</Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: 3D Console Device Visualization */}
              <div className="lg:col-span-5 w-full flex justify-center">
                <div className="w-full max-w-[420px] bg-card rounded-2xl border border-white/60 shadow-floating p-6 relative flex flex-col gap-5 select-none">
                  {/* Decorative corner screws */}
                  <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center"><div className="w-1.5 h-[1px] bg-foreground/30 rotate-12" /></div>
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center"><div className="w-1.5 h-[1px] bg-foreground/30 rotate-[130deg]" /></div>
                  <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center"><div className="w-1.5 h-[1px] bg-foreground/30 rotate-[65deg]" /></div>
                  <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center"><div className="w-1.5 h-[1px] bg-foreground/30 rotate-[210deg]" /></div>

                  {/* Vents in Console Panel */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-mono text-muted-foreground tracking-widest">CONSOLE_UNIT // MX-200</span>
                    <div className="flex gap-1">
                      <div className="ventilator-slot !h-4" />
                      <div className="ventilator-slot !h-4" />
                      <div className="ventilator-slot !h-4" />
                    </div>
                  </div>

                  {/* CRT Screen */}
                  <div className="crt-screen rounded-lg shadow-recessed p-4 font-mono text-green-400 text-xs border border-black/80 min-h-[160px] flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-green-500/20 pb-2 text-[10px]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        SYS_STATUS: RUNNING
                      </span>
                      <span>DIAG_REV2</span>
                    </div>
                    <div className="space-y-1 my-3 flex-1 flex flex-col justify-center text-[11px] leading-tight">
                      <div className="text-green-500/80">$ sys_load --all_products</div>
                      <div className="text-emerald-300 font-bold">» {reviews.length} INDEXED MODULES MOUNTED</div>
                      <div className="text-green-500/80">$ ping -c 1 supabase.db</div>
                      <div className="text-emerald-300 flex items-center gap-1">
                        » DB_STATE: <span className="bg-green-500/20 px-1 text-green-300 font-bold">CONNECTED_OK</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-green-500/50 pt-2 border-t border-green-500/20 flex justify-between">
                      <span>LOAD // 0.04</span>
                      <span>ACTIVE // OK</span>
                    </div>
                  </div>

                  {/* Mechanical Controls grid */}
                  <div className="grid grid-cols-3 gap-4 items-center bg-muted/30 rounded-lg p-3 border border-border/40">
                    {/* Toggle Switch */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">POWER</span>
                      <div className="w-6 h-10 rounded-full bg-muted shadow-recessed border border-border/60 p-0.5 flex flex-col justify-between items-center relative">
                        <div className="w-4.5 h-4.5 rounded-full bg-primary shadow-card border border-primary/20 transition-all cursor-pointer" />
                      </div>
                    </div>

                    {/* Rotary dial 1 */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">SENSITIVITY</span>
                      <div className="w-9 h-9 rounded-full bg-card shadow-card border border-white/60 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform duration-75">
                        <div className="absolute top-1 w-1 h-1.5 rounded-full bg-neutral-700/80" />
                      </div>
                    </div>

                    {/* Rotary dial 2 */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">BENCHMARK</span>
                      <div className="w-9 h-9 rounded-full bg-card shadow-card border border-white/60 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform duration-75">
                        <div className="absolute left-1 w-1.5 h-1 rounded-full bg-neutral-700/80" />
                      </div>
                    </div>
                  </div>

                  {/* Pulsing Status LEDs */}
                  <div className="flex justify-between items-center px-2 pt-1 border-t border-border/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-led-pulse animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">LED A</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">LED B</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">LED C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Reviews */}
        <section id="top-picks" className="py-20 container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-dashed border-border/60 pb-6">
            <div>
              <span className="tape-label text-[10px] font-mono text-neutral-800 px-2.5 py-0.5 uppercase tracking-widest inline-block mb-2">
                INDEXED MODULES // SECTION_01
              </span>
              <h2 className="text-2xl font-bold font-mono tracking-wider uppercase">FEATURED DIAGNOSTICS</h2>
              <p className="text-xs text-muted-foreground font-mono">Precision analytics & hardware bench performance indices.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/reviews" className="flex items-center gap-2">
                VIEW ALL RECORDS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
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
                    <CardTitle className="line-clamp-1 text-base">{review.title}</CardTitle>
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
        </section>

        {/* Newsletter Section */}
        <section className="py-16 container mx-auto px-4 max-w-6xl">
          <div className="bg-neutral-900 text-neutral-100 rounded-3xl border border-neutral-800 shadow-floating p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Top/Bottom safety hazard stripes */}
            <div className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none opacity-80" style={{ backgroundImage: "linear-gradient(45deg, #ff4757 25%, #171717 25%, #171717 50%, #ff4757 50%, #ff4757 75%, #171717 75%, #171717)" , backgroundSize: "16px 16px" }} />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 pointer-events-none opacity-80" style={{ backgroundImage: "linear-gradient(45deg, #ff4757 25%, #171717 25%, #171717 50%, #ff4757 50%, #ff4757 75%, #171717 75%, #171717)" , backgroundSize: "16px 16px" }} />

            <div className="space-y-4 max-w-lg text-left">
              <span className="bg-primary text-primary-foreground text-[9px] font-mono px-2 py-0.5 uppercase tracking-widest inline-block rounded">
                WARNING // SUBSCRIPTION_CHANNEL
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-mono uppercase tracking-wide">SUBSCRIBE_TO_THE_INDEX</h2>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Register your terminal to receive automated reports, product benchmarking sheets, and deep analysis logs directly to your mailbox weekly.
              </p>
            </div>
            <div className="w-full max-w-md shrink-0">
              <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="USER_EMAIL@DOMAIN.SYS" 
                  required 
                  className="flex h-11 w-full rounded-lg border-0 bg-neutral-950 px-4 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-600 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.8)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 transition-all"
                />
                <Button type="submit" size="sm" className="h-11 px-6 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground active:translate-y-[2px]">
                  CONNECT
                </Button>
              </form>
              <span className="text-[9px] font-mono text-neutral-600 mt-2 block">SECURE CHANNEL // SPAM_SHIELD_ACTIVE // UNSUB_ANYTIME</span>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-20 container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-dashed border-border/60 pb-6">
            <div>
              <span className="tape-label text-[10px] font-mono text-neutral-800 px-2.5 py-0.5 uppercase tracking-widest inline-block mb-2">
                TECHNICAL LOGS // SECTION_02
              </span>
              <h2 className="text-2xl font-bold font-mono tracking-wider uppercase">LATEST JOURNAL ENTRIES</h2>
              <p className="text-xs text-muted-foreground font-mono">Theoretical studies, guides, and engineering logs.</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/blog" className="flex items-center gap-2">
                BROWSE ALL LOGS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 border-0 shadow-recessed rounded-2xl bg-muted/50 flex flex-col items-center justify-center p-8">
              <Database className="w-12 h-12 text-muted-foreground/40 mb-3 animate-pulse" />
              <p className="text-sm font-mono text-muted-foreground">NO JOURNAL ENTRIES FOUND ON SECTOR_1</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <Card key={post.id} className="p-4 flex flex-col hover:shadow-floating transition-all duration-300 group">
                  <div className="h-40 rounded-lg overflow-hidden relative mb-4">
                    {post.featuredImage ? (
                      <Image 
                        src={post.featuredImage} 
                        alt={post.title} 
                        fill 
                        className="object-cover transition-all duration-300 filter grayscale group-hover:grayscale-0" 
                      />
                    ) : (
                      <div className="absolute inset-0 blueprint-grid bg-slate-900 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent" />
                        <span className="font-mono text-[9px] tracking-wider text-emerald-500/40 uppercase absolute top-2 left-2">DOC // REF_IMAGE</span>
                        <div className="w-12 h-12 border border-dashed border-emerald-500/20 rotate-45 flex items-center justify-center">
                          <span className="font-mono text-[9px] text-emerald-500/40 -rotate-45">RAW</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="tape-label text-[9px] text-neutral-800 font-mono px-2 py-0.5 uppercase tracking-wider inline-block mb-2">
                        {post.category}
                      </span>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-foreground line-clamp-2 mt-1 hover:text-primary transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground font-sans line-clamp-3 mt-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-dashed border-border/60 mt-4 flex justify-between items-center text-[9px] font-mono text-muted-foreground">
                      <span>DATE // {new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>VIEWS // {post.views || 0}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-12 bg-muted/30 font-mono text-xs">
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
