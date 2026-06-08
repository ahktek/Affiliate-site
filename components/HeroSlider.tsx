"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Slide {
  id: string;
  headline: string;
  subline: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  image_url: string;
  image_alt: string;
  overlay_opacity: number;
  overlay_color: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "default-1",
    headline: "The AI Revolution Deserves Honest Reviews",
    subline: "The world is flooded with AI tools. We test them so you don't waste money.",
    cta_primary_text: "Browse AI Tools",
    cta_primary_url: "/ai-tools",
    cta_secondary_text: "See Latest Reviews",
    cta_secondary_url: "/reviews",
    image_url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Developer desk with screens showing code and AI models",
    overlay_opacity: 0.5,
    overlay_color: "#1a1a18",
  },
  {
    id: "default-2",
    headline: "Find Your Perfect AI Tool in 60 Seconds",
    subline: "Use our Compare Tool to pit top AI tools head-to-head on what matters.",
    cta_primary_text: "Start Comparing",
    cta_primary_url: "/compare",
    cta_secondary_text: "How We Test",
    cta_secondary_url: "/about",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Split-screen software comparison interface on screens",
    overlay_opacity: 0.5,
    overlay_color: "#1a1a18",
  },
  {
    id: "default-3",
    headline: "Editor's Pick: This Month's Top AI Tools",
    subline: "Our editors hand-tested 40+ tools. These 5 made the cut.",
    cta_primary_text: "See Editor's Picks",
    cta_primary_url: "/#editors-picks",
    cta_secondary_text: "Read Full Report",
    cta_secondary_url: "/blog",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Warm editorial writing desk with laptop and coffee cup",
    overlay_opacity: 0.4,
    overlay_color: "#1a1a18",
  }
];

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slides from Supabase
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select("*")
          .eq("is_active", true)
          .order("slide_order", { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) {
          setSlides(data.map((item: any) => ({
            id: item.id,
            headline: item.headline,
            subline: item.subline || "",
            cta_primary_text: item.cta_primary_text || "Learn More",
            cta_primary_url: item.cta_primary_url || "/",
            cta_secondary_text: item.cta_secondary_text || "",
            cta_secondary_url: item.cta_secondary_url || "",
            image_url: item.image_url,
            image_alt: item.image_alt || "Editorial product image",
            overlay_opacity: Number(item.overlay_opacity) || 0.4,
            overlay_color: item.overlay_color || "#000000",
          })));
        }
      } catch (err) {
        console.warn("Failed to load slides, falling back to static slides.", err);
      }
    };

    fetchSlides();

    // Realtime channel subscription
    const channel = supabase
      .channel("hero_slides_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_slides" },
        () => {
          fetchSlides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
  };

  // Slides auto-advance logic
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    resetTimer();

    // Fill progress bar (6000ms / 60 intervals = 100ms intervals, incrementing by 1.66% per 100ms)
    const step = 1.666; // 100 / 60
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, 100);

    return () => {
      resetTimer();
    };
  }, [currentIndex, isPaused, slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const jumpToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative w-full h-[380px] md:h-[480px] lg:h-[600px] bg-zinc-950 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides display area */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Slide Background Image with subtle Ken Burns effect */}
            <motion.div
              initial={{ scale: 1.0 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 6, ease: "linear" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={currentSlide.image_url}
                alt={currentSlide.image_alt}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>

            {/* Custom Overlay Opacity and Hex Color */}
            <div
              className="absolute inset-0 transition-colors duration-300"
              style={{
                backgroundColor: currentSlide.overlay_color,
                opacity: currentSlide.overlay_opacity,
              }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 max-w-[1280px] mx-auto px-6 md:px-20 flex items-center">
              {/* Text Area - Left 50% on desktop, full-width on mobile */}
              <div className="w-full md:w-[60%] lg:w-[50%] bg-[#FAFAF7]/92 dark:bg-[#141412]/92 p-6 md:p-10 rounded-[6px] border border-border shadow-[0_12px_40px_rgba(0,0,0,0.15)] space-y-6">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.1em] font-semibold text-primary">
                  FEATURED ANALYSIS
                </span>
                
                <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-[2.25rem] leading-[1.15] text-[#1A1A18] dark:text-[#F0EFEA] tracking-tight">
                  {currentSlide.headline}
                </h2>
                
                <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                  {currentSlide.subline}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={currentSlide.cta_primary_url}
                    className="bg-primary text-primary-foreground font-sans text-xs font-semibold px-5 py-3 rounded-[6px] hover:bg-accent-hover text-center transition-colors shadow-sm"
                  >
                    {currentSlide.cta_primary_text}
                  </Link>
                  {currentSlide.cta_secondary_text && (
                    <Link
                      href={currentSlide.cta_secondary_url}
                      className="bg-transparent border border-border-emphasis text-foreground font-sans text-xs font-semibold px-5 py-3 rounded-[6px] hover:bg-secondary text-center transition-colors"
                    >
                      {currentSlide.cta_secondary_text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows (disappear on mobile) */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-white/40 text-white rounded-full bg-black/20 hover:bg-primary hover:border-transparent transition-all"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center border border-white/40 text-white rounded-full bg-black/20 hover:bg-primary hover:border-transparent transition-all"
        aria-label="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide Indicators: 3 thin horizontal bars displaying progress */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4 w-[240px] md:w-[320px]">
        {slides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => jumpToSlide(idx)}
              className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden focus:outline-none relative group"
              aria-label={`Go to slide ${idx + 1}`}
            >
              {/* Hover effect highlight */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Active Slide Loader progress bar */}
              {isCurrent && (
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${progress}%`,
                    transition: isPaused ? "none" : "width 100ms linear"
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
