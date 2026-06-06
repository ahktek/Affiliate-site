import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("posts")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) {
    return { title: "Post Not Found" };
  }
  
  return {
    title: `${data.meta_title || data.title} | AI Reviews`,
    description: data.meta_description || data.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) {
    notFound();
  }
  
  const post = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    featuredImage: data.featured_image,
    category: data.categories?.name || "",
    tags: data.tags,
    status: data.status,
    authorId: data.author_id,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    views: data.views,
  };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": new Date(post.createdAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": "Admin"
    }]
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
            <Link href="/blog" className="text-foreground transition-colors">BLOG</Link>
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
        <div className="container mx-auto max-w-3xl">
          <Script
            id="article-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Card className="p-8 md:p-12 relative">
            <header className="mb-10 pb-8 border-b border-dashed border-border/80 text-left">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="tape-label text-[10px] font-mono text-neutral-800 px-2.5 py-0.5 uppercase tracking-wider inline-block">
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  LOG // {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight uppercase leading-tight text-foreground mb-4">
                {post.title}
              </h1>
              <div className="text-xs font-mono text-muted-foreground uppercase flex gap-4">
                <span>READ_TIME // {Math.ceil(post.content.length / 1000)} MIN</span>
                <span>STATUS // REQ_VERIFIED</span>
              </div>
            </header>

            <div 
              className="prose prose-zinc dark:prose-invert max-w-none font-sans text-sm md:text-base leading-relaxed my-8
                prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-wider prose-headings:font-bold
                prose-h2:text-lg prose-h2:border-l-4 prose-h2:border-primary prose-h2:pl-3 prose-h2:mt-8
                prose-a:text-primary prose-a:underline prose-a:decoration-dashed
                prose-code:font-mono prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-12 pt-8 border-t border-dashed border-border/80 bg-muted/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none opacity-80" style={{ backgroundImage: "linear-gradient(45deg, #ff4757 25%, transparent 25%, transparent 50%, #ff4757 50%, #ff4757 75%, transparent 75%, transparent)" , backgroundSize: "12px 12px" }} />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                SUBSCRIBE TO THE LOG CHANNEL
              </h3>
              <p className="text-xs text-muted-foreground font-sans mb-4 leading-relaxed">
                Connect your user profile to receive automated tech alerts, benchmarking comparisons, and direct logs.
              </p>
              <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3">
                <input type="hidden" name="source" value={`blog-${post.slug}`} />
                <input 
                  type="email" 
                  name="email" 
                  placeholder="USER_EMAIL@DOMAIN.SYS" 
                  className="flex h-10 w-full rounded-lg border-0 bg-background shadow-recessed px-3.5 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  required 
                />
                <Button type="submit" size="sm" className="shrink-0 h-10 px-5 active:translate-y-[2px]">
                  CONNECT
                </Button>
              </form>
            </div>
          </Card>
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
