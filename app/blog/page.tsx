import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const revalidate = 3600;

export const metadata = {
  title: "Blog | AI Tools & SaaS Insights",
  description: "Read our latest articles on AI tools, SEO software, and digital marketing strategies.",
};

export default async function BlogListingPage() {
  const { data } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
    
  const posts = (data || []).map((p: any) => ({
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
        <div className="container mx-auto max-w-6xl">
          {/* Main Title section styled as system documentation header */}
          <div className="border-b border-dashed border-border/60 pb-8 mb-12 text-left">
            <span className="tape-label text-[10px] font-mono text-neutral-800 px-3 py-1 uppercase tracking-widest inline-block mb-3 shadow-sm">
              DATABASE SECTOR // JOURNAL_LOGS
            </span>
            <h1 className="text-4xl font-bold font-mono uppercase tracking-wider text-foreground mb-3">SYSTEM JOURNAL</h1>
            <p className="text-sm text-muted-foreground font-mono leading-relaxed">
              In-depth research analyses, design blueprints, workflow automation scripts, and software integration theories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Card key={post.id} className="p-4 flex flex-col hover:shadow-floating transition-all duration-300 group">
                <div className="h-44 rounded-lg overflow-hidden relative mb-4">
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
                    <h3 className="font-mono text-base font-bold uppercase tracking-wide text-foreground line-clamp-2 mt-1 hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-xs text-muted-foreground font-sans line-clamp-3 mt-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-dashed border-border/60 mt-4 flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                    <span>DATE // {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>VIEWS // {post.views || 0}</span>
                  </div>
                </div>
              </Card>
            ))}
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
