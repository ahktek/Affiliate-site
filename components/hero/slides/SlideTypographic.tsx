"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SlideProps } from "./types";

export default function SlideTypographic({ data, isActive }: SlideProps) {
  const {
    headline,
    subline,
    tag = "This Month's Editor's Pick",
    ctaPrimaryText,
    ctaPrimaryUrl,
    ctaSecondaryText,
    ctaSecondaryUrl,
    imageUrl,
    imageAlt = "Warm workspace aesthetic",
  } = data;

  const words = headline.split(" ");

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden text-[#FAFAF7] flex flex-col justify-between"
      style={{
        backgroundColor: "#1C1A14",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Accent Image on the Right (35% width on desktop, full background on mobile) */}
      <div className="absolute top-0 right-0 h-full w-full md:w-[35%] z-0 select-none pointer-events-none">
        <div 
          className="relative w-full h-full"
          style={{
            opacity: typeof window !== "undefined" && window.innerWidth < 768 ? 0.15 : 0.35,
          }}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 35vw"
            style={{
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 100%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 100%)",
            }}
            unoptimized
          />
        </div>
      </div>

      {/* Decorative vertical dots column (hidden on mobile) */}
      <div className="hidden md:flex absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 flex-col items-center gap-2 z-10">
        {[1, 2, 3, 4, 5].map((num) => {
          const isCurrent = num === 3;
          return (
            <div
              key={num}
              className="rounded-full transition-all duration-300"
              style={{
                width: isCurrent ? "7px" : "5px",
                height: isCurrent ? "7px" : "5px",
                backgroundColor: isCurrent ? "#C8502A" : "rgba(200,80,42,0.4)",
              }}
            />
          );
        })}
      </div>

      {/* Text Content Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-start pt-[12vh] md:pt-[18vh] px-6 md:pl-24 lg:pl-32 pr-6 max-w-[1280px] w-full mx-auto">
        <div className="w-full md:w-[65%] lg:w-[60%] relative">
          
          {/* Large Ghost Number "03" */}
          <div
            className="absolute -top-20 -left-6 font-display italic font-bold select-none pointer-events-none text-[160px] md:text-[220px] text-[#C8502A]/[0.08] z-0 leading-none"
            aria-hidden="true"
          >
            03
          </div>

          {/* Tagline */}
          <div className="flex flex-col items-start mb-5 relative z-10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="w-[40px] h-[1px] bg-[#C8502A] mb-3"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FAFAF7]/55"
            >
              {tag}
            </motion.span>
          </div>

          {/* Headline (focus blur reveal, Lora 400 with styled "5") */}
          <h2 className="font-display font-normal text-[1.8rem] sm:text-[2.2rem] md:text-[2.75rem] lg:text-[3rem] leading-[1.25] text-[#FAFAF7] tracking-[-0.01em] mb-5 relative z-10">
            {words.map((word, idx) => {
              const isFive = word.includes("5");
              return (
                <motion.span
                  key={idx}
                  style={{ display: "inline-block" }}
                  initial={{ filter: "blur(4px)", opacity: 0 }}
                  animate={isActive ? { filter: "blur(0px)", opacity: 1 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.35 + idx * 0.03,
                    ease: "easeOut",
                  }}
                  className={`mr-[0.25em] ${
                    isFive ? "font-serif font-bold italic text-[#C8502A]" : ""
                  }`}
                >
                  {word}
                </motion.span>
              );
            })}
          </h2>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="font-serif italic text-[1rem] leading-[1.6] text-[#FAFAF7]/60 mb-8 max-w-[480px] relative z-10"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {subline}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.85, ease: "easeOut" }}
            className="flex items-center gap-6 relative z-10"
          >
            {/* Primary Circle-Arrow Button */}
            <Link
              href={ctaPrimaryUrl}
              className="group inline-flex items-center gap-3 text-[#FAFAF7] font-sans text-[14px] font-medium"
            >
              <span>{ctaPrimaryText}</span>
              <span className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-[#C8502A] group-hover:border-[#C8502A] transition-all duration-200">
                <svg
                  className="w-3.5 h-3.5 text-white transform group-hover:translate-x-[1px] transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </span>
            </Link>

            {/* Secondary CTA */}
            {ctaSecondaryText && ctaSecondaryUrl && (
              <Link
                href={ctaSecondaryUrl}
                className="inline-block text-[#FAFAF7]/50 hover:text-[#FAFAF7]/90 font-sans text-[12px] hover:underline decoration-1 underline-offset-2 transition-colors duration-200"
              >
                {ctaSecondaryText}
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Signature / Colophon Placement (hidden on mobile) */}
      <div className="hidden md:block w-full px-8 pb-8 relative z-10">
        <div className="max-w-[1280px] w-full mx-auto font-sans text-[10px] uppercase tracking-[0.06em] text-[#FAFAF7]/25">
          Updated June 2026 · ahktek.com
        </div>
      </div>
    </div>
  );
}
