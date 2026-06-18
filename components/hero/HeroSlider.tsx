"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { SlideData } from "./slides/types";
import SlideEditorial from "./slides/SlideEditorial";
import SlideDarkCover from "./slides/SlideDarkCover";
import SlideTypographic from "./slides/SlideTypographic";
import SliderControls from "./SliderControls";

const DEFAULT_SLIDES: SlideData[] = [
  {
    headline: "The AI Revolution Deserves Honest Reviews",
    subline: "The world is flooded with AI tools. We test them so you don't waste money.",
    tag: "No. 1 Trusted AI Review Source",
    ctaPrimaryText: "Browse AI Tools",
    ctaPrimaryUrl: "/ai-tools",
    ctaSecondaryText: "See Latest Reviews",
    ctaSecondaryUrl: "/reviews",
    imageUrl: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Developer desk with screens showing code and AI models",
  },
  {
    headline: "Find Your Perfect AI Tool in 60 Seconds",
    subline: "Use our Compare Tool to pit top AI tools head-to-head.",
    tag: "Compare 40+ AI Tools",
    ctaPrimaryText: "Start Comparing",
    ctaPrimaryUrl: "/compare",
    ctaSecondaryText: "How We Test",
    ctaSecondaryUrl: "/about",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Split-screen software comparison interface on screens",
  },
  {
    headline: "Our editors tested 40+ tools. These 5 made the cut.",
    subline: "Hand-tested by our editorial team. No affiliate influence on our ratings.",
    tag: "This Month's Editor's Pick",
    ctaPrimaryText: "See Editor's Picks",
    ctaPrimaryUrl: "/#editors-picks",
    ctaSecondaryText: "Read Full Report",
    ctaSecondaryUrl: "/blog",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    imageAlt: "Warm editorial writing desk with laptop and coffee cup",
  }
];

interface HeroSliderProps {
  initialSlides?: any[];
}

export default function HeroSlider({ initialSlides }: HeroSliderProps) {
  // Map raw slides into SlideData shape
  const getMappedSlides = (rawSlides: any[]): SlideData[] => {
    if (!rawSlides || rawSlides.length === 0) return DEFAULT_SLIDES;
    return rawSlides.map((item: any, idx: number) => {
      let defaultTag = "No. 1 Trusted AI Review Source";
      if (idx % 3 === 1) defaultTag = "Compare 40+ AI Tools";
      if (idx % 3 === 2) defaultTag = "This Month's Editor's Pick";

      return {
        headline: item.headline,
        subline: item.subline || "",
        tag: defaultTag,
        ctaPrimaryText: item.cta_primary_text || "Learn More",
        ctaPrimaryUrl: item.cta_primary_url || "/",
        ctaSecondaryText: item.cta_secondary_text || "",
        ctaSecondaryUrl: item.cta_secondary_url || "",
        imageUrl: item.image_url,
        imageAlt: item.image_alt || "Editorial product review image",
        overlayOpacity: Number(item.overlay_opacity) || 0.4,
        overlayColor: item.overlay_color || "#000000",
      };
    });
  };

  const [slides, setSlides] = useState<SlideData[]>(() => getMappedSlides(initialSlides || []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

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
          const mapped = data.map((item: any, idx: number) => {
            let defaultTag = "No. 1 Trusted AI Review Source";
            if (idx % 3 === 1) defaultTag = "Compare 40+ AI Tools";
            if (idx % 3 === 2) defaultTag = "This Month's Editor's Pick";

            return {
              headline: item.headline,
              subline: item.subline || "",
              tag: defaultTag,
              ctaPrimaryText: item.cta_primary_text || "Learn More",
              ctaPrimaryUrl: item.cta_primary_url || "/",
              ctaSecondaryText: item.cta_secondary_text || "",
              ctaSecondaryUrl: item.cta_secondary_url || "",
              imageUrl: item.image_url,
              imageAlt: item.image_alt || "Editorial product review image",
              overlayOpacity: Number(item.overlay_opacity) || 0.4,
              overlayColor: item.overlay_color || "#000000",
            };
          });
          setSlides(mapped);
        }
      } catch (err) {
        console.warn("Failed to load slides from Supabase, showing defaults", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();

    // Subscribe to realtime database updates
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

  // Monitor visibilityState
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Reset 7s timer on index change
  useEffect(() => {
    if (isHovered || !isVisible || slides.length === 0) return;

    const timer = setTimeout(() => {
      handleNext();
    }, 7000);

    return () => clearTimeout(timer);
  }, [currentIndex, isHovered, isVisible, slides.length]);

  const handleNext = () => {
    if (slides.length === 0) return;
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleJump = (index: number) => {
    if (slides.length === 0) return;
    setDirection(index > currentIndex ? "next" : "prev");
    setCurrentIndex(index);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  // Swipe gestures
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    delta: 50,
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  const currentSlide = slides[currentIndex] || DEFAULT_SLIDES[0];

  const slideVariants = {
    enter: (dir: "next" | "prev") => ({
      x: dir === "next" ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "next" | "prev") => ({
      x: dir === "next" ? -80 : 80,
      opacity: 0,
    }),
  };

  const renderSlide = (slide: SlideData, index: number, isActive: boolean, dir: "next" | "prev") => {
    const layoutIndex = index % 3;
    if (layoutIndex === 0) {
      return <SlideEditorial data={slide} isActive={isActive} direction={dir} />;
    } else if (layoutIndex === 1) {
      return <SlideDarkCover data={slide} isActive={isActive} direction={dir} />;
    } else {
      return <SlideTypographic data={slide} isActive={isActive} direction={dir} />;
    }
  };

  return (
    <section
      {...swipeHandlers}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[100svh] md:h-[70vh] md:min-h-[460px] lg:h-[92vh] lg:min-h-[560px] lg:max-h-[780px] bg-zinc-950 overflow-hidden focus:outline-none select-none"
      role="region"
      aria-label="Featured content slider"
    >
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", duration: 0.7, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            }}
            className="absolute inset-0 w-full h-full"
            aria-label={`Slide ${currentIndex + 1} of ${slides.length}: ${currentSlide.headline}`}
          >
            {renderSlide(currentSlide, currentIndex, true, direction)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Shared Navigation Controls and Progress Bars */}
      <SliderControls
        currentIndex={currentIndex}
        slidesCount={slides.length}
        isPaused={isHovered || !isVisible}
        onPrev={handlePrev}
        onNext={handleNext}
        onJump={handleJump}
        sliderHovered={isHovered}
      />
    </section>
  );
}
