"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  overallRating: number;
  createdAt: number;
}

interface Post {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  createdAt: number;
}

interface Category {
  id: string | number;
  name: string;
}

interface HomePageClientProps {
  reviews: Review[];
  posts: Post[];
  categories: Category[];
}

export default function HomePageClient({ reviews, posts, categories }: HomePageClientProps) {
  const heroReview = reviews[0];
  const secondaryReviews = reviews.slice(1, 4); // 3 reviews for asymmetric layout
  const editorsPicks = reviews.slice(4, 8); // Taller cards horizontal scroll
  
  // Category signature hues
  const categoryHues = [
    "bg-[#FDF2EE] text-[#A83E1F]", // Amber/Red
    "bg-[#F7F6EE] text-[#736F38]", // Sage/Olive
    "bg-[#F2F6F7] text-[#3E6B7A]", // Cool Slate
    "bg-[#F5F2F7] text-[#693E7A]", // Deep Lavender
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-8 pb-16 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch min-h-[480px]">
            {/* Left aligned headline */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-8 pr-0 lg:pr-8">
              <h1 className="font-display font-bold text-4xl md:text-[4rem] leading-[1.08] tracking-tight text-foreground">
                We test the tools.<br />
                You build the future.
              </h1>
              <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Independent, data-driven reviews of AI software and digital tools. We do the hours of research so you don't have to.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="#latest-reviews"
                  className="bg-primary text-primary-foreground font-sans text-sm font-medium px-6 py-3 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] transition-all duration-200 shadow-[0_4px_12px_rgba(200,80,42,0.18)]"
                >
                  Explore Reviews
                </Link>
                <Link
                  href="/blog"
                  className="bg-secondary text-foreground border border-border font-sans text-sm font-medium px-6 py-3 rounded-[6px] hover:bg-border/30 transition-all duration-200"
                >
                  Read Editorial Blog
                </Link>
              </div>
            </div>

            {/* Thin accent line vertical divider */}
            <div className="hidden lg:block lg:col-span-1 justify-self-center w-[1px] bg-border-emphasis relative my-6">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
            </div>

            {/* Right side featured image */}
            <div className="lg:col-span-4 relative h-[300px] lg:h-auto min-h-[350px] overflow-hidden rounded-[6px] group">
              {heroReview ? (
                <Link href={`/reviews/${heroReview.slug}`} className="block w-full h-full relative">
                  <Image
                    src={heroReview.featuredImage}
                    alt={heroReview.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover rounded-[6px] transition-transform duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <span className="font-sans text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px] self-start mb-3">
                      LATEST REVIEW
                    </span>
                    <h3 className="font-display font-medium text-xl md:text-2xl text-white line-clamp-2 leading-snug">
                      {heroReview.title}
                    </h3>
                    <p className="font-body text-xs text-zinc-300 mt-2 flex items-center gap-1.5">
                      Rating: <span className="font-mono font-bold text-primary">{heroReview.overallRating.toFixed(1)}/10</span>
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground font-body">
                  No review published yet.
                </div>
              )}
            </div>
          </div>

          {/* Below Hero: Horizontal Scrolling Category Pill Nav */}
          <div className="mt-12 flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Browse Topics:
            </span>
            <Link
              href="/reviews"
              className="font-sans text-xs uppercase tracking-[0.08em] px-4 py-2 border border-border rounded-full hover:bg-secondary transition-all whitespace-nowrap bg-background text-foreground"
            >
              All Categories
            </Link>
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/reviews?category=${cat.id}`}
                className="font-sans text-xs uppercase tracking-[0.08em] px-4 py-2 border border-border rounded-full hover:border-primary/40 hover:bg-secondary transition-all whitespace-nowrap bg-background text-foreground"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* EDITORIAL GRID SECTION */}
        <section id="latest-reviews" className="py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                HANDS-ON ANALYSIS
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                In-Depth Product Reviews
              </h2>
            </div>
            <Link
              href="/reviews"
              className="font-sans text-sm font-semibold text-primary hover:text-accent-hover mt-4 md:mt-0 flex items-center gap-1.5 transition-colors group"
            >
              View all reviews
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-secondary border border-border rounded-[6px]">
              <p className="font-body text-muted-foreground">No review articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Column 1: Wide hero card */}
              <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border pb-8 lg:pb-0 lg:pr-10">
                {heroReview && (
                  <article className="space-y-6 group">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-secondary">
                      <Image
                        src={heroReview.featuredImage}
                        alt={heroReview.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      />
                      <span className="absolute bottom-3 left-3 font-sans text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-primary bg-accent-light px-2.5 py-1 rounded-[4px]">
                        {heroReview.category}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(heroReview.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-1 font-sans text-xs font-bold text-primary bg-accent-light px-2 py-0.5 rounded-[4px]">
                          <Star size={12} className="fill-current" />
                          <span>{heroReview.overallRating.toFixed(1)}</span>
                        </div>
                      </div>
                      <h3 className="font-display font-semibold text-2xl text-foreground group-hover:text-primary transition-colors leading-snug">
                        <Link href={`/reviews/${heroReview.slug}`}>
                          {heroReview.title}
                        </Link>
                      </h3>
                      <p className="font-body text-[0.95rem] text-muted-foreground leading-relaxed line-clamp-3">
                        {heroReview.excerpt || "Read our deep dive review analyzing key features, pros, cons, and performance scores."}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        href={`/reviews/${heroReview.slug}`}
                        className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-all"
                      >
                        Read Full Review
                      </Link>
                    </div>
                  </article>
                )}
              </div>

              {/* Column 2 & 3 stacked: Narrow thumbnail cards */}
              <div className="lg:col-span-7 flex flex-col justify-start space-y-8">
                {secondaryReviews.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground font-body text-sm">
                    No additional reviews.
                  </div>
                ) : (
                  secondaryReviews.map((review) => (
                    <article
                      key={review.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-start border-b border-border pb-6 last:border-b-0 last:pb-0 group"
                    >
                      <div className="sm:col-span-1 relative aspect-square overflow-hidden rounded-[6px] bg-secondary w-full">
                        <Image
                          src={review.featuredImage}
                          alt={review.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                        />
                      </div>
                      <div className="sm:col-span-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[0.7rem] uppercase tracking-[0.08em] text-primary font-semibold">
                            {review.category}
                          </span>
                          <div className="flex items-center gap-1 font-sans text-xs font-semibold text-primary">
                            <Star size={11} className="fill-current" />
                            <span>{review.overallRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                          <Link href={`/reviews/${review.slug}`}>
                            {review.title}
                          </Link>
                        </h3>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {review.excerpt || "Read our detailed hands-on review to see if this is the right tool for you."}
                        </p>
                        <div className="pt-1">
                          <span className="font-sans text-[0.7rem] text-muted-foreground">
                            Published {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* EDITOR'S PICKS SECTION */}
        <section className="py-20 bg-secondary/40 transition-colors border-b border-border overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                  CURATED SELECTS
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Editor's Picks
                </h2>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground select-none">
                <button
                  onClick={() => {
                    const scrollContainer = document.getElementById("picks-scroll");
                    if (scrollContainer) scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
                  }}
                  className="p-2.5 rounded-full border border-border hover:bg-background hover:text-foreground transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    const scrollContainer = document.getElementById("picks-scroll");
                    if (scrollContainer) scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
                  }}
                  className="p-2.5 rounded-full border border-border hover:bg-background hover:text-foreground transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Strip */}
            <div
              id="picks-scroll"
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-6 px-6 md:mx-0 md:px-0"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {editorsPicks.length === 0 ? (
                <div className="w-full text-center py-12 text-muted-foreground font-body text-sm">
                  Curated picks will appear here.
                </div>
              ) : (
                editorsPicks.map((pick) => (
                  <div
                    key={pick.id}
                    className="flex-shrink-0 w-[280px] md:w-[320px] snap-start bg-card border border-border rounded-[6px] p-5 space-y-4 hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-secondary group">
                      <Image
                        src={pick.featuredImage}
                        alt={pick.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-[4px] font-mono text-xs font-bold text-white">
                        ★ {pick.overallRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.08em] text-primary">
                        {pick.category}
                      </span>
                      <h3 className="font-display font-medium text-lg text-foreground line-clamp-2 leading-snug">
                        <Link href={`/reviews/${pick.slug}`}>
                          {pick.title}
                        </Link>
                      </h3>
                      <p className="font-body text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {pick.excerpt || "Our editors have hand-selected this product based on its quality, specs, and performance."}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* COMPARISON TEASER */}
        {reviews.length >= 2 && (
          <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                HEAD-TO-HEAD
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                How They Match Up
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">
                Direct comparisons of top-tier software. Look closely at the data scores.
              </p>
            </div>

            {/* Versus Layout */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-center bg-secondary/30 p-8 md:p-12 rounded-[6px] border border-border">
              {/* Product 1 */}
              <div className="md:col-span-5 flex flex-col items-center md:items-end text-center md:text-right space-y-4">
                <div className="relative w-24 h-24 rounded-[6px] overflow-hidden bg-background border border-border">
                  <Image
                    src={reviews[0].featuredImage}
                    alt={reviews[0].title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-muted-foreground">{reviews[0].category}</span>
                  <h3 className="font-display font-semibold text-xl text-foreground mt-1">{reviews[0].title}</h3>
                </div>
                <div className="bg-primary/10 border border-primary/20 text-primary font-display font-bold text-2xl w-14 h-14 rounded-full flex items-center justify-center">
                  {reviews[0].overallRating.toFixed(1)}
                </div>
                <Link
                  href={`/reviews/${reviews[0].slug}`}
                  className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read Review →
                </Link>
              </div>

              {/* VERSUS Indicator */}
              <div className="md:col-span-1 flex justify-center py-4 md:py-0">
                <span className="font-sans text-xs font-bold text-muted-foreground bg-background border border-border-emphasis w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                  VS
                </span>
              </div>

              {/* Product 2 */}
              <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                <div className="relative w-24 h-24 rounded-[6px] overflow-hidden bg-background border border-border">
                  <Image
                    src={reviews[1].featuredImage}
                    alt={reviews[1].title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="font-sans text-xs uppercase tracking-wider text-muted-foreground">{reviews[1].category}</span>
                  <h3 className="font-display font-semibold text-xl text-foreground mt-1">{reviews[1].title}</h3>
                </div>
                <div className="bg-primary/10 border border-primary/20 text-primary font-display font-bold text-2xl w-14 h-14 rounded-full flex items-center justify-center">
                  {reviews[1].overallRating.toFixed(1)}
                </div>
                <Link
                  href={`/reviews/${reviews[1].slug}`}
                  className="font-sans text-xs uppercase tracking-[0.08em] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Read Review →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* LATEST BLOG POSTS */}
        <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                EDITORIAL INSIGHTS
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Latest from the Chronicle
              </h2>
            </div>
            <Link
              href="/blog"
              className="font-sans text-sm font-semibold text-primary hover:text-accent-hover mt-4 md:mt-0 flex items-center gap-1.5 transition-colors group"
            >
              Go to blog
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 bg-secondary border border-border rounded-[6px]">
              <p className="font-body text-muted-foreground">No blog articles published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="space-y-4 group">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-secondary">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
                        {post.category}
                      </span>
                      <span className="text-muted-foreground font-mono text-[0.75rem]">•</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {post.excerpt || "Read our latest article exploring digital trends, tech insights, and editorial opinions."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* NEWSLETTER CAPTURE */}
        <section id="newsletter" className="py-20 bg-secondary transition-colors duration-300">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card border border-border p-8 md:p-12 rounded-[6px]">
              <div className="lg:col-span-6 space-y-4">
                <h3 className="font-display font-medium italic text-2xl md:text-3xl text-foreground">
                  Stay ahead of every buying decision.
                </h3>
                <p className="font-body text-sm text-muted-foreground max-w-md leading-relaxed">
                  One email per week. Honest testing, software roundups, and exclusive promo codes. No spam, ever. Unsubscribe instantly.
                </p>
              </div>

              <div className="lg:col-span-6">
                <form action="/api/subscribe" method="POST" className="flex flex-col sm:flex-row sm:items-end gap-6 w-full">
                  <div className="flex-1 flex flex-col space-y-1">
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      className="w-full font-sans text-sm bg-transparent border-b border-border-emphasis pb-3 pt-2 px-1 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex-1 flex flex-col space-y-1">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email address"
                      required
                      className="w-full font-sans text-sm bg-transparent border-b border-border-emphasis pb-3 pt-2 px-1 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground font-sans text-sm font-medium px-6 py-3 h-[42px] rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] transition-all duration-200 shadow-[0_4px_12px_rgba(200,80,42,0.18)] whitespace-nowrap self-stretch sm:self-auto"
                  >
                    Get Weekly Picks →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORY BROWSER */}
        <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block">
              TOPICAL TAXONOMY
            </span>
            <h2 className="font-display font-bold text-3xl text-foreground mt-2">
              Browse by Interest
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, index) => {
              const hueClass = categoryHues[index % categoryHues.length];
              return (
                <Link
                  key={cat.id}
                  href={`/reviews?category=${cat.id}`}
                  className={`${hueClass} aspect-[1.5] flex flex-col justify-between p-6 rounded-[6px] transition-all duration-300 hover:scale-[1.025] hover:shadow-sm border border-transparent hover:border-border`}
                >
                  <span className="font-sans text-[0.7rem] uppercase tracking-[0.1em] font-semibold opacity-80">
                    CATEGORY
                  </span>
                  <h3 className="font-display font-bold text-lg md:text-xl leading-tight">
                    {cat.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
