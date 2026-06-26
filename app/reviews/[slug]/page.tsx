import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ScoreWidget from "@/components/ScoreWidget";
import ProsConsWidget from "@/components/ProsConsWidget";
import ComparisonTable from "@/components/ComparisonTable";
import { ExternalLink, Star, ArrowLeft } from "lucide-react";
import AuthorByline from "@/components/ui/AuthorByline";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) return { title: "Review Not Found" };
  
  return {
    title: `${data.meta_title || data.title} Review (${new Date().getFullYear()}) | Optura Vibe`,
    description: data.meta_description || data.excerpt,
  };
}

export default async function SingleReviewPage({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("*, categories(*)")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) notFound();
  
  const review = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content || "",
    excerpt: data.excerpt || "",
    featuredImage: data.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    category: data.categories?.name || "Uncategorized",
    categorySlug: data.categories?.slug || "",
    categoryId: data.category_id,
    overallRating: (Number(data.overall_rating) || 0) * 2,
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

  // Fetch comparison products: up to 3 reviews in the same category (excluding current review)
  const { data: compData } = await supabase
    .from("reviews")
    .select("*, categories(*)")
    .eq("status", "published")
    .eq("category_id", review.categoryId)
    .neq("id", review.id)
    .limit(3);
   
  const comparisonProducts = (compData || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: r.categories?.name || "Uncategorized",
    overallRating: (Number(r.overall_rating) || 0) * 2,
    scores: r.scores || {},
    ctaLinks: r.cta_links || [],
  }));

  // Fetch author details
  let authorName = "Editorial Staff";
  let authorBio = "Senior product analyst covering AI software and productivity tools.";
  let authorAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80";
  let authorSlug = "";

  if (review.authorId) {
    const { data: authorData } = await supabase
      .from("authors")
      .select("*")
      .eq("id", review.authorId)
      .maybeSingle();
    
    if (authorData) {
      authorName = authorData.display_name || "Editorial Staff";
      if (authorData.bio) authorBio = authorData.bio;
      if (authorData.avatar_url) authorAvatar = authorData.avatar_url;
      authorSlug = authorData.slug;
    }
  }

  // Fetch related articles (other reviews in same category, or any recent review)
  const { data: relatedData } = await supabase
    .from("reviews")
    .select("*, categories(*)")
    .eq("status", "published")
    .neq("id", review.id)
    .limit(3);

  const relatedReviews = (relatedData || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    category: r.categories?.name || "Uncategorized",
  }));

  // Calculate read time
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 220;
    const cleanText = text.replace(/<[^>]*>/g, ""); // strip HTML
    const wordCount = cleanText ? cleanText.split(/\s+/g).length : 0;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };
  const readTime = calculateReadTime(review.content);

  // Split review content into lead/intro paragraph and remaining content for scorecard placement
  const firstParagraphIndex = review.content.indexOf("</p>");
  let introParagraph = "";
  let remainingContent = review.content;
  if (firstParagraphIndex !== -1) {
    introParagraph = review.content.substring(0, firstParagraphIndex + 4);
    remainingContent = review.content.substring(firstParagraphIndex + 4);
  }

  // JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": review.title,
    "image": review.featuredImage,
    "description": review.excerpt || review.metaDescription,
    "brand": {
      "@type": "Brand",
      "name": review.title
    },
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.overallRating,
        "bestRating": "10"
      },
      "author": {
        "@type": "Person",
        "name": authorName,
        "url": authorSlug ? `/author/${authorSlug}` : undefined
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Schema Injection */}
      <Script
        id="product-schema"
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
              href="/reviews"
              className="inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Reviews</span>
            </Link>

            {review.categorySlug ? (
              <Link
                href={`/category/${review.categorySlug}`}
                className="editorial-tag hover:text-primary transition-colors duration-200"
              >
                {review.category}
              </Link>
            ) : (
              <div className="editorial-tag">
                {review.category}
              </div>
            )}

            <h1 className="font-display font-bold text-3xl md:text-[2.50rem] leading-[1.15] tracking-tight text-foreground">
              {review.title} Review
            </h1>

            {review.excerpt && (
              <p className="font-body text-[1.1875rem] text-foreground/90 leading-relaxed font-normal">
                {review.excerpt}
              </p>
            )}

            {/* Author + Date + Read Time Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-y border-border py-4 text-xs font-sans text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">By</span>
                <AuthorByline authorName={authorName} authorSlug={authorSlug} authorAvatar={authorAvatar} showAvatar={true} />
              </div>
              <span className="font-mono text-border-emphasis select-none">|</span>
              <time dateTime={new Date(review.createdAt).toISOString()}>
                {new Date(review.createdAt).toLocaleDateString("en-US", {
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
              src={review.featuredImage}
              alt={review.title}
              fill
              className="object-cover animate-image-load"
              priority
            />
          </div>

          {/* Centered Article Reading Column (680px) */}
          <div className="max-w-[680px] mx-auto">
            {/* Intro paragraph with drop cap styled inside globals.css */}
            <div className="prose-editorial">
              {introParagraph ? (
                <div dangerouslySetInnerHTML={{ __html: introParagraph }} />
              ) : (
                <p className="italic text-muted-foreground">No content body found.</p>
              )}
            </div>

            {/* Scoreboard Widget: Positioned right after intro paragraph */}
            {review.overallRating > 0 && (
              <ScoreWidget
                overallScore={review.overallRating}
                subScores={review.scores}
                productName={review.title}
              />
            )}

            {/* Core Review Body */}
            {remainingContent && (
              <div
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: remainingContent }}
              />
            )}

            {/* CTA Button */}
            {review.ctaLinks?.length > 0 && (
              <div className="my-10 flex flex-col sm:flex-row gap-4 justify-center">
                {review.ctaLinks.map((cta: any, i: number) => (
                  <a
                    key={i}
                    href={`/go/${review.slug}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans text-sm font-semibold px-6 py-3.5 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] transition-all duration-150 shadow-[0_4px_12px_rgba(200,80,42,0.18)]"
                  >
                    <span>{cta.label}</span>
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            )}

            {/* Pros & Cons Block */}
            {(review.pros.length > 0 || review.cons.length > 0) && (
              <ProsConsWidget pros={review.pros} cons={review.cons} />
            )}

            {/* Comparison Table (inset within the reading width or slightly expanded) */}
            <ComparisonTable
              currentProduct={{
                id: review.id,
                title: review.title,
                slug: review.slug,
                featuredImage: review.featuredImage,
                category: review.category,
                overallRating: review.overallRating,
                scores: review.scores,
                ctaLinks: review.ctaLinks,
              }}
              comparisonProducts={comparisonProducts}
            />

            {/* Author Block */}
            <div className="border-t border-border pt-8 mt-16 flex items-start gap-5">
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-secondary border border-border">
                {authorSlug ? (
                  <Link href={`/author/${authorSlug}`}>
                    <Image
                      src={authorAvatar}
                      alt={authorName}
                      fill
                      sizes="64px"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                ) : (
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="space-y-2">
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-lg text-foreground leading-tight">
                    {authorSlug ? (
                      <Link href={`/author/${authorSlug}`} className="hover:text-primary transition-colors duration-200">
                        {authorName}
                      </Link>
                    ) : (
                      authorName
                    )}
                  </h4>
                  <span className="font-sans text-[0.7rem] uppercase tracking-wider text-muted-foreground block">
                    EDITORIAL CONTRIBUTOR
                  </span>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed max-w-lg">
                  {authorBio}
                </p>
                {authorSlug ? (
                  <Link
                    href={`/author/${authorSlug}`}
                    className="inline-block font-sans text-xs font-semibold text-primary hover:text-accent-hover transition-colors duration-200"
                  >
                    More from {authorName} →
                  </Link>
                ) : (
                  <span className="font-sans text-xs text-muted-foreground italic">
                    Editorial Team
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Related Articles Section - Outside centered reading flow, inside full grid width */}
          {relatedReviews.length > 0 && (
            <div className="border-t border-border mt-20 pt-16">
              <h3 className="font-display font-semibold text-2xl text-foreground mb-8 text-center md:text-left">
                Related Reading
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedReviews.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/reviews/${related.slug}`}
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
