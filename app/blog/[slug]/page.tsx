import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { ArrowLeft } from "lucide-react";

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
    title: `${data.meta_title || data.title} | Chronicle`,
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
    content: data.content || "",
    excerpt: data.excerpt || "",
    featuredImage: data.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: data.categories?.name || "Uncategorized",
    tags: data.tags || [],
    status: data.status,
    authorId: data.author_id,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    views: data.views,
  };

  // Fetch author details
  let authorName = "Editorial Staff";
  let authorBio = "Senior product analyst covering AI software and productivity tools.";
  let authorAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";

  if (post.authorId) {
    const { data: authorData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", post.authorId)
      .maybeSingle();
    
    if (authorData) {
      authorName = authorData.display_name || authorData.email || "Editorial Staff";
      if (authorData.bio) authorBio = authorData.bio;
      if (authorData.avatar_url) authorAvatar = authorData.avatar_url;
    }
  }

  // Fetch related posts (other posts in database)
  const { data: relatedData } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("status", "published")
    .neq("id", post.id)
    .limit(3);

  const relatedPosts = (relatedData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    category: p.categories?.name || "Uncategorized",
  }));

  // Calculate read time
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 220;
    const cleanText = text.replace(/<[^>]*>/g, ""); // strip HTML
    const wordCount = cleanText ? cleanText.split(/\s+/g).length : 0;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };
  const readTime = calculateReadTime(post.content);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": post.featuredImage,
    "description": post.excerpt,
    "datePublished": new Date(post.createdAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": authorName
    }]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Thin sticky Reading Progress Bar */}
      <ReadingProgressBar />

      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1 py-12">
        <article className="max-w-[1280px] mx-auto px-6 md:px-20">
          
          {/* Header Column */}
          <div className="max-w-[680px] mx-auto space-y-6 text-left mb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Blog</span>
            </Link>

            <div className="editorial-tag">
              {post.category}
            </div>

            <h1 className="font-display font-bold text-3xl md:text-[2.50rem] leading-[1.15] tracking-tight text-foreground">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="font-body text-[1.1875rem] text-foreground/90 leading-relaxed font-normal">
                {post.excerpt}
              </p>
            )}

            {/* Author + Date + Read Time Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-y border-border py-4 text-xs font-sans text-muted-foreground">
              <span className="font-medium text-foreground">By {authorName}</span>
              <span className="font-mono text-border-emphasis select-none">|</span>
              <time dateTime={new Date(post.createdAt).toISOString()}>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span className="font-mono text-border-emphasis select-none">|</span>
              <span>{readTime} min read</span>
            </div>
          </div>

          {/* Featured Image - Content Width */}
          <div className="max-w-[680px] mx-auto aspect-[16/9] relative overflow-hidden rounded-[6px] mb-12 bg-secondary border border-border">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover animate-image-load"
              priority
            />
          </div>

          {/* Centered Article Reading Column (680px) */}
          <div className="max-w-[680px] mx-auto">
            {/* Body content with drop cap & styling inside globals.css */}
            {post.content ? (
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="italic text-muted-foreground">No content body found.</p>
            )}

            {/* Author Block */}
            <div className="border-t border-border pt-8 mt-16 flex items-start gap-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-secondary border border-border">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-lg text-foreground leading-tight">
                    {authorName}
                  </h4>
                  <span className="font-sans text-[0.7rem] uppercase tracking-wider text-muted-foreground block">
                    EDITORIAL CONTRIBUTOR
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-lg">
                  {authorBio}
                </p>
                <Link
                  href="/blog"
                  className="inline-block font-sans text-xs font-semibold text-primary hover:text-accent-hover transition-colors"
                >
                  More from {authorName} →
                </Link>
              </div>
            </div>

            {/* Newsletter Capture Component Inside Blog Details */}
            <div className="bg-secondary/40 border border-border p-6 md:p-8 rounded-[6px] my-12 transition-colors duration-300">
              <h3 className="font-display font-medium italic text-xl text-foreground mb-2">
                Enjoyed this article?
              </h3>
              <p className="font-body text-xs text-muted-foreground mb-4 max-w-md leading-relaxed">
                Subscribe to our newsletter to get more insights like this delivered to your inbox once a week.
              </p>
              <NewsletterForm source={`blog-${post.slug}`} compact />
            </div>
          </div>

          {/* Related Articles Section - Outside centered reading flow, inside full grid width */}
          {relatedPosts.length > 0 && (
            <div className="border-t border-border mt-20 pt-16">
              <h3 className="font-display font-semibold text-2xl text-foreground mb-8 text-center md:text-left">
                Related Reading
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="flex gap-4 items-start group border-b md:border-b-0 border-border pb-4 md:pb-0"
                  >
                    <div className="relative w-20 h-20 rounded-[6px] overflow-hidden bg-secondary shrink-0">
                      <Image
                        src={related.featuredImage}
                        alt={related.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-primary block">
                        {related.category}
                      </span>
                      <h4 className="font-body font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </article>
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
