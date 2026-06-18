import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const revalidate = 3600;

export const metadata = {
  title: "Blog | AI Tools & SaaS Insights | Chronicle",
  description: "Read our latest articles on AI tools, SEO software, and digital marketing strategies.",
};

export default async function BlogListingPage() {
  const { data } = await supabase
    .from("posts")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
    
  const posts = (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt,
    featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: p.categories?.name || "Uncategorized",
    categorySlug: p.categories?.slug || "",
    tags: p.tags,
    status: p.status,
    authorId: p.author_id,
    createdAt: new Date(p.created_at).getTime(),
    updatedAt: new Date(p.updated_at).getTime(),
    views: p.views,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20">
        {/* Page Header */}
        <div className="max-w-[680px] mb-12 md:mb-16 space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block">
            EDITORIAL LOG
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-foreground">
            The Chronicle Blog
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            In-depth guides, industry analyses, and strategic columns written by editors who test software.
          </p>
        </div>

        {/* Alternating Masonry Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-secondary border border-border rounded-[6px]">
            <p className="font-body text-muted-foreground">No posts published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {posts.map((post: any, index: number) => {
              // Alternating: Even indices (0, 2, 4...) get 2/3 width (col-span-2) with image
              // Odd indices (1, 3, 5...) get 1/3 width (col-span-1) with text only
              const isTwoThirds = index % 2 === 0;

              if (isTwoThirds) {
                return (
                  <article
                    key={post.id}
                    className="lg:col-span-2 bg-card border border-border rounded-[6px] p-6 hover:border-primary/40 transition-all duration-300 flex flex-col md:flex-row gap-6 group"
                  >
                    {/* Left: Featured Image */}
                    <div className="relative w-full md:w-2/5 aspect-[16/10] md:aspect-auto rounded-[4px] overflow-hidden bg-secondary">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                    </div>
                    {/* Right: Content */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {post.categorySlug ? (
                            <Link href={`/category/${post.categorySlug}`} className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary hover:text-[#A83E1F] transition-colors duration-200">
                              {post.category}
                            </Link>
                          ) : (
                            <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
                              {post.category}
                            </span>
                          )}
                          <span className="text-muted-foreground font-mono text-[0.75rem]">•</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <h3 className="font-display font-semibold text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors leading-tight">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {post.excerpt || "Read our latest column for strategies, industry news, and product reviews."}
                        </p>
                      </div>
                      <div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
                        >
                          Read Article
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              } else {
                return (
                  <article
                    key={post.id}
                    className="lg:col-span-1 bg-card border border-border rounded-[6px] p-6 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {post.categorySlug ? (
                          <Link href={`/category/${post.categorySlug}`} className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary hover:text-[#A83E1F] transition-colors duration-200">
                            {post.category}
                          </Link>
                        ) : (
                          <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
                            {post.category}
                          </span>
                        )}
                        <span className="text-muted-foreground font-mono text-[0.75rem]">•</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {post.excerpt || "Read our latest column for strategies, industry news, and product reviews."}
                      </p>
                    </div>
                    <div className="pt-6">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
                      >
                        Read Article
                      </Link>
                    </div>
                  </article>
                );
              }
            })}
          </div>
        )}
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
