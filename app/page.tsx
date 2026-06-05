import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Star } from "lucide-react";
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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-2xl tracking-tight">AI<span className="text-primary">Reviews</span></Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/category/ai-writing" className="text-sm font-medium hover:text-primary">AI Writing</Link>
            <Link href="/category/seo" className="text-sm font-medium hover:text-primary">SEO Tools</Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary">Blog</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden md:flex">
              <Link href="/search">Search</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/login">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-950 text-center px-4">
          <div className="container max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Discover the Best AI Tools for Your Workflow
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              In-depth reviews, side-by-side comparisons, and expert guides to help you choose the right software and scale your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="#top-picks">See Top Picks <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/blog">Read Our Blog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Reviews */}
        <section id="top-picks" className="py-20 container">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Reviews</h2>
              <p className="text-muted-foreground">Our latest in-depth tool analysis.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/reviews">View all <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
          
          {reviews.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-muted-foreground">No reviews published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review: any) => (
                <Card key={review.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                  <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative">
                    {/* Placeholder for image */}
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                      [Product Image]
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                          {review.category}
                        </span>
                        <CardTitle className="mt-2">{review.title}</CardTitle>
                      </div>
                      <div className="flex items-center bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md font-bold text-sm">
                        <Star className="w-4 h-4 mr-1 fill-current" /> {review.overallRating}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {review.excerpt || review.metaDescription}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/reviews/${review.slug}`}>Read Review</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Join 20,000+ Marketers</h2>
            <p className="text-lg text-primary-foreground/80">
              Get the latest AI tool reviews, exclusive discounts, and growth strategies delivered to your inbox every week.
            </p>
            <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                required 
                className="h-12 bg-primary-foreground text-primary border-transparent focus-visible:ring-primary-foreground"
              />
              <Button type="submit" size="lg" variant="secondary" className="h-12 shrink-0">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-primary-foreground/60">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-20 container">
          <h2 className="text-3xl font-bold tracking-tight mb-10">Latest from the Blog</h2>
          {posts.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-muted-foreground">No posts published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.map((post: any) => (
                <article key={post.id} className="space-y-4 group">
                  <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                     <div className="absolute inset-0 flex items-center justify-center text-zinc-400 group-hover:scale-105 transition-transform duration-300">
                      [Featured Image]
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-primary">{post.category}</span>
                    <h3 className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-zinc-50 dark:bg-zinc-950">
        <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <span className="font-bold text-xl tracking-tight">AI<span className="text-primary">Reviews</span></span>
            <p className="text-sm text-muted-foreground max-w-xs">
              Empowering businesses with the best AI tools and software recommendations.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/ai-writing" className="hover:text-foreground">AI Writing</Link></li>
              <li><Link href="/category/seo" className="hover:text-foreground">SEO Tools</Link></li>
              <li><Link href="/category/marketing" className="hover:text-foreground">Marketing</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="hover:text-foreground">Affiliate Disclaimer</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AI Reviews. All rights reserved.</p>
          <p className="mt-4 md:mt-0 text-xs">Some links may be affiliate links. We may earn a commission at no extra cost to you.</p>
        </div>
      </footer>
    </div>
  );
}
