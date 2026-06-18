"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SlideProps } from "./types";

export default function SlideEditorial({ data, isActive }: SlideProps) {
  const {
    headline,
    subline,
    tag = "No. 1 Trusted AI Review Source",
    ctaPrimaryText,
    ctaPrimaryUrl,
    ctaSecondaryText,
    ctaSecondaryUrl,
    imageUrl,
    imageAlt = "Editorial product review",
  } = data;

  const headlineWords = headline.split(" ");
  const isHeadlineLong = headline.length > 50;

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col md:flex-row bg-[#FAFAF7] overflow-hidden">
      {/* LEFT HALF - TEXT PANEL */}
      <div className="w-full h-[60%] md:h-full md:w-[50%] lg:w-[50%] flex flex-col justify-center bg-[#FAFAF7] text-[#1A1A18] relative z-10 order-2 md:order-1">
        {/* Editorial Divider Line */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={isActive ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ originY: 0 }}
          className="hidden md:block w-[2px] bg-[#C8502A] h-full absolute right-0 top-0 z-20"
        />
        
        <div className="w-full max-w-[480px] mx-auto px-5 md:px-10 py-6 md:py-16 flex flex-col justify-center h-full">
          {/* Tagline */}
          <div className="flex flex-col items-start mb-4">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              style={{ originX: 0 }}
              className="w-[20px] h-[1px] bg-[#C8502A] mb-2"
            />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={isActive ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C8502A]"
            >
              {tag}
            </motion.span>
          </div>

          {/* Headline */}
          <h2
            className={`font-display font-bold leading-[1.15] text-[#1A1A18] tracking-tight mb-4 flex flex-wrap ${
              isHeadlineLong 
                ? "text-[1.8rem] sm:text-[2.2rem] md:text-[2.25rem] lg:text-[2.5rem]" 
                : "text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.25rem]"
            }`}
          >
            {headlineWords.map((word, idx) => (
              <motion.span
                key={idx}
                style={{ display: "inline-block" }}
                initial={{ y: 12, opacity: 0 }}
                animate={isActive ? { y: 0, opacity: 1 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 0.35 + idx * 0.04,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </h2>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            className="font-serif text-[1.0625rem] leading-[1.7] text-[#6B6B63] mb-6 max-w-full"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {subline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
            className="flex items-center gap-6"
          >
            {/* Primary CTA */}
            <Link
              href={ctaPrimaryUrl}
              className="inline-block bg-[#C8502A] text-white font-sans text-[13px] font-medium tracking-[0.03em] px-6 py-3 rounded-[4px] border border-transparent shadow-sm hover:bg-[#A83E1F] hover:translate-y-[-1px] hover:shadow-[0_4px_16px_rgba(200,80,42,0.25)] transition-all duration-180 ease-out"
            >
              {ctaPrimaryText}
            </Link>

            {/* Secondary CTA */}
            {ctaSecondaryText && ctaSecondaryUrl && (
              <Link
                href={ctaSecondaryUrl}
                className="group inline-flex items-center text-[#1A1A18] font-sans text-[13px] font-medium hover:underline decoration-1 underline-offset-2 transition-colors duration-180"
              >
                <span>{ctaSecondaryText}</span>
                <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-180">
                  &rarr;
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* RIGHT HALF - IMAGE PANEL */}
      <div className="w-full h-[40%] md:h-full md:w-[50%] lg:w-[50%] relative overflow-hidden order-1 md:order-2">
        {/* Mobile divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isActive ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0 }}
          className="block md:hidden h-[2px] bg-[#C8502A] w-full absolute bottom-0 left-0 z-20"
        />

        <motion.div
          className="absolute inset-0 w-[104%] h-full"
          initial={{ scale: 1.02, x: 0 }}
          animate={
            isActive
              ? {
                  scale: 1.0,
                  x: "-2%",
                  transition: {
                    scale: { duration: 0.8, ease: "easeOut" },
                    x: { duration: 7, ease: "linear", delay: 0.8 },
                  },
                }
              : { scale: 1.02, x: 0 }
          }
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        </motion.div>
      </div>
    </div>
  );
}
