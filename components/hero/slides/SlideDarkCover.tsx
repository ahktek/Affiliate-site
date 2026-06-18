"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SlideProps } from "./types";

export default function SlideDarkCover({ data, isActive }: SlideProps) {
  const {
    headline,
    subline,
    tag = "Compare 40+ AI Tools",
    ctaPrimaryText,
    ctaPrimaryUrl,
    ctaSecondaryText,
    ctaSecondaryUrl,
    imageUrl,
    imageAlt = "Dark tech review background",
  } = data;

  // Split headline into lines
  const splitHeadline = (text: string) => {
    if (text.includes("\n")) return text.split("\n");
    const words = text.split(" ");
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  const lines = splitHeadline(headline);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0A0A09] overflow-hidden text-white flex flex-col justify-between">
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 1.0 }}
          animate={
            isActive
              ? {
                  scale: 1.04,
                  transition: { duration: 7, ease: "linear" },
                }
              : { scale: 1.0 }
          }
          style={{ filter: "sepia(0.12)" }}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        </motion.div>

        {/* Cinematic Gradient Overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(105deg, rgba(10,10,9,0.95) 0%, rgba(10,10,9,0.75) 45%, rgba(10,10,9,0.20) 70%, rgba(10,10,9,0) 100%)",
          }}
        />
      </div>

      {/* Main Text Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-start pt-[14vh] md:pt-[18vh] px-5 md:px-[10%] max-w-[1280px] w-full mx-auto">
        <div className="max-w-[580px] relative">
          {/* Large Ghost Number "40+" */}
          <div
            className="absolute -top-16 -right-6 font-display italic font-bold select-none pointer-events-none text-[120px] md:text-[160px] text-white/[0.04] z-0 leading-none"
            aria-hidden="true"
          >
            40+
          </div>

          {/* Tagline Badge */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={isActive ? { scale: 1.0, opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
            className="inline-block bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-[4px] mb-5 relative z-10"
          >
            <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-white/90">
              {tag}
            </span>
          </motion.div>

          {/* Headline with clipPath animations line by line */}
          <h2 className="font-display font-bold text-[2rem] sm:text-[2.5rem] md:text-[3.25rem] lg:text-[3.5rem] leading-[1.1] text-white tracking-tight mb-5 relative z-10">
            {lines.map((line, idx) => (
              <span
                key={idx}
                className="block overflow-hidden relative"
                style={{ paddingBottom: "4px" }}
              >
                <motion.span
                  className="block"
                  initial={{ clipPath: "inset(100% 0 0 0)" }}
                  animate={isActive ? { clipPath: "inset(0% 0 0 0)" } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + idx * 0.15,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
            className="font-serif text-[1.0625rem] leading-[1.6] text-white/70 mb-8 max-w-[480px] relative z-10"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {subline}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isActive ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
            className="flex items-center gap-6 relative z-10"
          >
            {/* Outline Primary Button */}
            <Link
              href={ctaPrimaryUrl}
              className="inline-block bg-transparent text-white font-sans text-[13px] font-medium tracking-[0.03em] px-7 py-3.5 rounded-[3px] border-[1.5px] border-white hover:bg-white hover:text-[#0A0A09] transition-colors duration-200"
            >
              {ctaPrimaryText}
            </Link>

            {/* Secondary CTA */}
            {ctaSecondaryText && ctaSecondaryUrl && (
              <Link
                href={ctaSecondaryUrl}
                className="group inline-flex items-center text-white/65 hover:text-white font-sans text-[13px] font-medium border-b border-white/30 hover:border-white transition-all duration-200 pb-0.5"
              >
                <span>{ctaSecondaryText}</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">
                  &rarr;
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="w-full h-12 bg-black/60 border-t border-white/12 flex items-center justify-between px-5 md:px-[10%] relative z-10"
      >
        <div className="max-w-[1280px] w-full mx-auto flex items-center justify-start gap-4 md:gap-8 font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-white/55">
          <span>40+ Tools Tested</span>
          <span className="w-[1px] h-3 bg-white/20" />
          <span className="hidden md:inline">Updated Monthly</span>
          <span className="hidden md:inline w-[1px] h-3 bg-white/20" />
          <span>Zero Sponsored Reviews</span>
        </div>
      </motion.div>
    </div>
  );
}
