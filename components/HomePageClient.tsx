"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { useCompareStore } from "@/lib/store/compareStore";
import { 
  Star, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  User, 
  Clock, 
  DollarSign, 
  Zap, 
  Info,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  overallRating: number;
  createdAt: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  createdAt: number;
}

interface Category {
  id: string;
  name: string;
}

interface EditorsPick {
  id: string;
  type: "review" | "post" | "tool";
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  overallRating?: number;
  createdAt: number;
  featuredOrder: number;
}

interface AIProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  screenshotUrls?: string[];
  category: string;
  overallScore: number;
  pricingModel: string;
  hasFreeTier: boolean;
  startingPrice: string;
  apiAvailable: boolean;
  verdict: string;
}

interface HomePageClientProps {
  heroSlides: any[];
  reviews: Review[];
  posts: Post[];
  categories: Category[];
  editorsPicks: EditorsPick[];
  comparisonProducts: AIProduct[];
  aiToolsTeaser: any[];
}

export default function HomePageClient({
  heroSlides,
  reviews,
  posts,
  categories,
  editorsPicks,
  comparisonProducts,
  aiToolsTeaser,
}: HomePageClientProps) {
  const addItem = useCompareStore((state) => state.addItem);
  const removeItem = useCompareStore((state) => state.removeItem);
  const compareItems = useCompareStore((state) => state.items);

  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  const handleReviewsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) return;
    
    // Width of a card + gap.
    // md:w-[330px], gap-6 => 354px. Mobile: w-[290px], gap-6 => 314px.
    const isMobile = window.innerWidth < 768;
    const cardStep = isMobile ? 314 : 354;
    
    const newIndex = Math.min(
      reviews.length - 1,
      Math.max(0, Math.round(scrollLeft / cardStep))
    );
    
    if (newIndex !== activeReviewIndex) {
      setActiveReviewIndex(newIndex);
    }
  };

  const scrollToReview = (index: number) => {
    const container = document.getElementById("reviews-scroll");
    if (container) {
      const isMobile = window.innerWidth < 768;
      const cardStep = isMobile ? 314 : 354;
      container.scrollTo({ left: index * cardStep, behavior: "smooth" });
      setActiveReviewIndex(index);
    }
  };

  // Stagger animation container variants
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  // Format the updated month/year for Editors Picks
  const formattedUpdatedDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Sticky Premium Navbar */}
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SLIDER */}
        <HeroSlider initialSlides={heroSlides} />

        {/* 2. EDITOR'S PICKS GRID BOX */}
        <section id="editors-picks" className="py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
          <div className="flex items-baseline space-x-3 mb-10 pl-4 border-l-4 border-primary">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground leading-none">
              Editor's Picks
            </h2>
            <span className="font-sans text-xs text-muted-foreground">
              Updated {formattedUpdatedDate}
            </span>
          </div>

          <motion.div
            variants={gridContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Row 1, Card 1: 1 large hero card (left, 60% width) */}
            {editorsPicks[0] && (
              <motion.div variants={cardVariants} className="lg:col-span-7 flex flex-col justify-between group">
                <Link href={`/${editorsPicks[0].type === "post" ? "blog" : "reviews"}/${editorsPicks[0].slug}`} className="block space-y-6">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-secondary border border-border">
                    <Image
                      src={editorsPicks[0].featuredImage}
                      alt={editorsPicks[0].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                    />
                    <span className="absolute bottom-4 left-4 font-sans text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px]">
                      {editorsPicks[0].category}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-sans text-xs">
                        <Clock size={12} />
                        <span>
                          {new Date(editorsPicks[0].createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {editorsPicks[0].overallRating !== undefined && editorsPicks[0].overallRating > 0 && (
                        <div className="flex items-center gap-1 font-sans text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[4px]">
                          <Star size={12} className="fill-current" />
                          <span>{editorsPicks[0].overallRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors leading-tight">
                      {editorsPicks[0].title}
                    </h3>
                    <p className="font-body text-[0.95rem] text-muted-foreground leading-relaxed line-clamp-2">
                      {editorsPicks[0].excerpt}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Row 1, Card 2: 1 tall card (right, 40% width) */}
            {editorsPicks[1] && (
              <motion.div variants={cardVariants} className="lg:col-span-5 flex flex-col justify-between group">
                <Link href={`/${editorsPicks[1].type === "post" ? "blog" : "reviews"}/${editorsPicks[1].slug}`} className="block space-y-6">
                  <div className="relative aspect-[16/12] lg:aspect-square overflow-hidden rounded-[6px] bg-secondary border border-border">
                    <Image
                      src={editorsPicks[1].featuredImage}
                      alt={editorsPicks[1].title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                    />
                    <span className="absolute bottom-4 left-4 font-sans text-[0.7rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-[4px]">
                      {editorsPicks[1].category}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-sans text-xs">
                        <Clock size={12} />
                        <span>
                          {new Date(editorsPicks[1].createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {editorsPicks[1].overallRating !== undefined && editorsPicks[1].overallRating > 0 && (
                        <div className="flex items-center gap-1 font-sans text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-[4px]">
                          <Star size={12} className="fill-current" />
                          <span>{editorsPicks[1].overallRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors leading-tight">
                      {editorsPicks[1].title}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {editorsPicks[1].excerpt}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Row 2: 3 equal cards (or dynamic collapse) */}
            {editorsPicks.slice(2).map((pick, index) => {
              const remainingCount = editorsPicks.slice(2).length;
              const colSpanClass = remainingCount === 3 
                ? "lg:col-span-4" 
                : remainingCount === 2 
                  ? "lg:col-span-6" 
                  : "lg:col-span-12";
              return (
                <motion.div
                  key={pick.id}
                  variants={cardVariants}
                  className={`${colSpanClass} border-t border-border pt-8 mt-4 lg:mt-0 flex flex-col justify-between group`}
                >
                  <Link href={`/${pick.type === "post" ? "blog" : "reviews"}/${pick.slug}`} className="block space-y-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-secondary border border-border">
                      <Image
                        src={pick.featuredImage}
                        alt={pick.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      />
                      <span className="absolute bottom-3 left-3 font-sans text-[0.65rem] uppercase tracking-[0.08em] font-semibold text-primary-foreground bg-primary px-2 py-0.5 rounded-[4px]">
                        {pick.category}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-muted-foreground font-sans text-xs">
                          <Clock size={11} />
                          <span>
                            {new Date(pick.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        {pick.overallRating !== undefined && pick.overallRating > 0 && (
                          <div className="flex items-center gap-0.5 font-sans text-xs font-bold text-primary">
                            <Star size={11} className="fill-current" />
                            <span>{pick.overallRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {pick.title}
                      </h3>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {pick.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* 3. QUICK COMPARISON SECTION */}
        {comparisonProducts && comparisonProducts.length >= 2 && (
          <section className="py-20 bg-secondary/30 border-b border-border">
            <div className="max-w-[1280px] mx-auto px-6 md:px-20">
              <div className="text-center max-w-xl mx-auto mb-16">
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                  HEAD TO HEAD
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Featured Matchup
                </h2>
                <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed">
                  Updated picks from our editors comparing core features and specs side-by-side.
                </p>
              </div>

              {/* Matchup Widget Grid */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-8 items-stretch bg-card p-8 md:p-12 rounded-[6px] border border-border relative">
                {/* Product A */}
                <div className="md:col-span-5 flex flex-col items-center justify-between text-center space-y-6">
                  <div className="relative aspect-[16/9] w-full rounded-[6px] overflow-hidden bg-secondary border border-border">
                    <Image
                      src={comparisonProducts[0].screenshotUrls?.[0] || comparisonProducts[0].logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"}
                      alt={comparisonProducts[0].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <span className="font-sans text-[0.65rem] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary border border-border rounded-full">
                      {comparisonProducts[0].category}
                    </span>
                    <h3 className="font-display font-bold text-2xl text-foreground mt-2">{comparisonProducts[0].name}</h3>
                  </div>

                  {/* Circular Score Badge */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center shadow-sm">
                      <span className="font-display font-bold text-2xl text-primary">{Number(comparisonProducts[0].overallScore).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="w-full space-y-3 pt-2 text-left border-t border-border">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-border/50">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><DollarSign size={12} /> Pricing Model</span>
                      <span className="font-sans font-medium text-foreground uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-[4px]">{comparisonProducts[0].pricingModel}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-border/50">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><Zap size={12} /> Starting Price</span>
                      <span className="font-body font-medium text-foreground">{comparisonProducts[0].startingPrice || "$0"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><Info size={12} /> API Access</span>
                      <span className="font-sans font-medium text-foreground">{comparisonProducts[0].apiAvailable ? "Available" : "No"}</span>
                    </div>
                  </div>

                  {/* Verdict Pill */}
                  <span className="font-sans text-xs uppercase tracking-wider font-semibold text-primary bg-[#FDF2EE] dark:bg-[#2c150c] px-3 py-1 rounded-full border border-primary/20">
                    {comparisonProducts[0].verdict.replace("-", " ")}
                  </span>
                </div>

                {/* Vertical Center Divider with VS */}
                <div className="md:col-span-1 flex flex-row md:flex-col items-center justify-center gap-4 relative py-6 md:py-0">
                  <div className="hidden md:block w-[1px] flex-1 bg-border" />
                  <span className="font-sans text-xs font-bold text-muted-foreground bg-secondary border border-border-emphasis w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                    VS
                  </span>
                  <div className="hidden md:block w-[1px] flex-1 bg-border" />
                </div>

                {/* Product B */}
                <div className="md:col-span-5 flex flex-col items-center justify-between text-center space-y-6">
                  <div className="relative aspect-[16/9] w-full rounded-[6px] overflow-hidden bg-secondary border border-border">
                    <Image
                      src={comparisonProducts[1].screenshotUrls?.[0] || comparisonProducts[1].logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"}
                      alt={comparisonProducts[1].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <span className="font-sans text-[0.65rem] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary border border-border rounded-full">
                      {comparisonProducts[1].category}
                    </span>
                    <h3 className="font-display font-bold text-2xl text-foreground mt-2">{comparisonProducts[1].name}</h3>
                  </div>

                  {/* Circular Score Badge */}
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-primary bg-primary/5 flex items-center justify-center shadow-sm">
                      <span className="font-display font-bold text-2xl text-primary">{Number(comparisonProducts[1].overallScore).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Specs List */}
                  <div className="w-full space-y-3 pt-2 text-left border-t border-border">
                    <div className="flex justify-between items-center text-xs py-1 border-b border-border/50">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><DollarSign size={12} /> Pricing Model</span>
                      <span className="font-sans font-medium text-foreground uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-[4px]">{comparisonProducts[1].pricingModel}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1 border-b border-border/50">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><Zap size={12} /> Starting Price</span>
                      <span className="font-body font-medium text-foreground">{comparisonProducts[1].startingPrice || "$0"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs py-1">
                      <span className="font-sans text-muted-foreground flex items-center gap-1.5"><Info size={12} /> API Access</span>
                      <span className="font-sans font-medium text-foreground">{comparisonProducts[1].apiAvailable ? "Available" : "No"}</span>
                    </div>
                  </div>

                  {/* Verdict Pill */}
                  <span className="font-sans text-xs uppercase tracking-wider font-semibold text-primary bg-[#FDF2EE] dark:bg-[#2c150c] px-3 py-1 rounded-full border border-primary/20">
                    {comparisonProducts[1].verdict.replace("-", " ")}
                  </span>
                </div>
              </div>

              {/* Full Comparison Link Button */}
              <div className="mt-8 text-center">
                <Link
                  href={`/compare?ids=${comparisonProducts[0].id},${comparisonProducts[1].id}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-sans text-sm font-semibold px-8 py-3.5 rounded-[6px] hover:bg-accent-hover transition-all shadow-md shadow-primary/10 w-full sm:w-auto"
                >
                  <span>See Full Comparison</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 4. LATEST REVIEWS HORIZONTAL SCROLL STRIP */}
        <section className="py-20 border-b border-border overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 md:px-20">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                  HANDS-ON TESTING
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Latest Software Reviews
                </h2>
              </div>
            </div>
 
            {/* Horizontal Scroll Strip Container */}
            <div
              id="reviews-scroll"
              onScroll={handleReviewsScroll}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-6 px-6 md:mx-0 md:px-0"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[290px] md:w-[330px] snap-start bg-card border border-border rounded-[6px] p-5 space-y-4 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-secondary group">
                      <Image
                        src={review.featuredImage}
                        alt={review.title}
                        fill
                        sizes="(max-width: 768px) 290px, 330px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-[4px] font-mono text-xs font-bold text-white flex items-center gap-0.5">
                        ★ {review.overallRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
                        {review.category}
                      </span>
                      <h3 className="font-display font-medium text-lg text-foreground line-clamp-1 leading-snug hover:text-primary transition-colors">
                        <Link href={`/reviews/${review.slug}`}>{review.title}</Link>
                      </h3>
                      <p className="font-body text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {review.excerpt}
                      </p>
                    </div>
                  </div>
 
                  <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <Link
                      href={`/reviews/${review.slug}`}
                      className="font-sans text-xs font-semibold text-primary hover:text-accent-hover transition-colors"
                    >
                      Read Review →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls below the carousel */}
            {reviews.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-8 select-none">
                <button
                  onClick={() => scrollToReview(activeReviewIndex - 1)}
                  disabled={activeReviewIndex === 0}
                  className="p-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2">
                  {reviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToReview(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        idx === activeReviewIndex
                          ? "bg-primary w-4"
                          : "bg-border hover:bg-border-emphasis"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => scrollToReview(activeReviewIndex + 1)}
                  disabled={activeReviewIndex === reviews.length - 1}
                  className="p-2.5 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. AI TOOLS DIRECTORY TEASER */}
        {aiToolsTeaser && aiToolsTeaser.length > 0 && (
          <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-20 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block mb-2">
                  AI DIRECTORY
                </span>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                  Browse AI Tools
                </h2>
              </div>
              <Link
                href="/compare"
                className="font-sans text-sm font-semibold text-primary hover:text-accent-hover mt-4 md:mt-0 flex items-center gap-1.5 transition-colors group"
              >
                Open directory & compare
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiToolsTeaser.map((tool) => {
                const isInCompare = compareItems.some((i) => i.id === tool.id);
                return (
                  <div
                    key={tool.id}
                    className="bg-card border border-border rounded-[6px] p-6 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="relative w-12 h-12 rounded-[6px] overflow-hidden bg-secondary border border-border">
                          <Image
                            src={tool.logoUrl}
                            alt={tool.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-bold px-2 py-0.5 rounded-[4px]">
                          ★ {Number(tool.overallScore).toFixed(1)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[0.65rem] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary border border-border rounded-full">
                            {tool.category}
                          </span>
                          <span className="font-sans text-[10px] uppercase font-semibold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-[4px]">
                            {tool.pricingModel}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mt-1">{tool.name}</h3>
                        <p className="font-body text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-border flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (isInCompare) {
                            removeItem(tool.id);
                          } else {
                            addItem({
                              id: tool.id,
                              name: tool.name,
                              slug: tool.slug,
                              logoUrl: tool.logoUrl,
                              category: tool.category,
                              overallScore: tool.overallScore,
                            });
                          }
                        }}
                        className={`flex-1 font-sans text-xs font-semibold px-4 py-2.5 rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${
                          isInCompare
                            ? "bg-secondary text-foreground border border-primary"
                            : "bg-transparent text-foreground border border-border hover:border-primary"
                        }`}
                      >
                        {isInCompare ? (
                          <>
                            <Check size={13} className="text-primary" />
                            <span>Compared</span>
                          </>
                        ) : (
                          <>
                            <Layers size={13} />
                            <span>Compare</span>
                          </>
                        )}
                      </button>
                      <Link
                        href={`/reviews/${tool.slug}`}
                        className="font-sans text-xs font-semibold bg-secondary hover:bg-border/30 text-foreground border border-border px-4 py-2.5 rounded-[6px] text-center transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}



        {/* 7. LATEST BLOG POSTS */}
        <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-20">
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
              {posts.slice(0, 3).map((post) => (
                <article key={post.id} className="space-y-4 group">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-secondary border border-border">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
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
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* 8. EDITORIAL FOOTER */}
      <Footer />
    </div>
  );
}
