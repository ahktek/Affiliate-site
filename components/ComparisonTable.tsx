"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";

interface Product {
  id: string | number;
  title: string;
  slug: string;
  featuredImage: string;
  category: string;
  overallRating: number;
  scores: {
    performance?: number;
    value?: number;
    design?: number;
    easeOfUse?: number;
  };
  ctaLinks?: { label: string; url: string }[];
}

interface ComparisonTableProps {
  currentProduct: Product;
  comparisonProducts: Product[];
}

export default function ComparisonTable({ currentProduct, comparisonProducts }: ComparisonTableProps) {
  // Combine current product and comparison products (max 4 total)
  const products = [currentProduct, ...comparisonProducts].slice(0, 4);

  if (products.length < 2) {
    return null; // Don't show if there's nothing to compare
  }

  // Find the winning product (highest overall rating)
  const winner = products.reduce((prev, current) => 
    (prev.overallRating > current.overallRating) ? prev : current
  );

  // Helper to find the max score for a specific metric key
  const getBestScore = (key: "performance" | "value" | "design" | "easeOfUse" | "overallRating") => {
    return Math.max(...products.map(p => {
      if (key === "overallRating") return p.overallRating;
      return p.scores?.[key] ?? 0;
    }));
  };

  const bestScores = {
    overallRating: getBestScore("overallRating"),
    performance: getBestScore("performance"),
    value: getBestScore("value"),
    design: getBestScore("design"),
    easeOfUse: getBestScore("easeOfUse"),
  };

  const rows = [
    { label: "Overall Rating", key: "overallRating", isRating: true },
    { label: "Performance", key: "performance", isSubScore: true },
    { label: "Value For Money", key: "value", isSubScore: true },
    { label: "Design Aesthetics", key: "design", isSubScore: true },
    { label: "Ease of Use", key: "easeOfUse", isSubScore: true },
  ];

  return (
    <div className="w-full my-16 -mx-4 md:-mx-8 px-4 md:px-8 overflow-x-auto scrollbar-hide">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="font-sans text-[0.7rem] font-semibold tracking-wider text-primary uppercase block">
          SPECIFICATION MATCHUP
        </span>
        <h3 className="font-display font-bold text-2xl text-foreground mt-2">
          Side-by-Side Comparison
        </h3>
      </div>

      <div className="min-w-[700px] border border-border bg-secondary/20 rounded-[6px] relative overflow-hidden">
        <table className="w-full border-collapse">
          {/* Table Headers */}
          <thead>
            {/* Winner Badge Row */}
            <tr className="border-b border-border bg-secondary/50">
              <th className="sticky left-0 z-10 w-[180px] min-w-[180px] bg-secondary/90 border-r border-border p-2"></th>
              {products.map((product) => {
                const isWinner = product.id === winner.id;
                return (
                  <th key={`badge-${product.id}`} className={`p-2 text-center ${isWinner ? "border-t-2 border-t-primary" : ""}`}>
                    {isWinner ? (
                      <span className="inline-block bg-primary text-primary-foreground font-sans text-[0.65rem] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider animate-pulse">
                        Best Pick
                      </span>
                    ) : (
                      <span className="inline-block h-5"></span>
                    )}
                  </th>
                );
              })}
            </tr>
            {/* Main Header */}
            <tr className="border-b border-border-emphasis bg-secondary/60">
              <th className="sticky left-0 z-10 w-[180px] min-w-[180px] bg-secondary/90 border-r border-border text-left p-4 font-sans text-[0.75rem] font-bold text-muted-foreground uppercase tracking-wider">
                Product Details
              </th>
              {products.map((product) => {
                const isCurrent = product.id === currentProduct.id;
                return (
                  <th key={`head-${product.id}`} className="p-4 text-center space-y-3">
                    <div className="relative w-12 h-12 mx-auto rounded-[4px] overflow-hidden bg-background border border-border shadow-sm">
                      <Image
                        src={product.featuredImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <Link href={`/reviews/${product.slug}`} className="font-display text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </Link>
                      {isCurrent && (
                        <span className="inline-block bg-accent-light text-primary text-[0.65rem] font-sans font-medium px-2 py-0.25 rounded-[3px]">
                          This Review
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-border/40 hover:bg-secondary/40 transition-colors duration-150">
                <td className="sticky left-0 z-10 w-[180px] min-w-[180px] bg-secondary/90 border-r border-border p-4 font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {row.label}
                </td>
                {products.map((product) => {
                  let val = 0;
                  if (row.isRating) {
                    val = product.overallRating;
                  } else {
                    const k = row.key as "performance" | "value" | "design" | "easeOfUse";
                    val = product.scores?.[k] ?? 0;
                  }

                  const isBest = val === bestScores[row.key as keyof typeof bestScores] && val > 0;

                  return (
                    <td key={`${row.key}-${product.id}`} className="p-4 text-center font-mono text-sm">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-[4px] ${
                        isBest
                          ? "bg-accent-light text-primary font-bold border border-primary/20"
                          : "text-foreground"
                      }`}>
                        {row.isRating && <Star size={11} className={isBest ? "fill-primary" : "text-muted-foreground"} />}
                        <span>{val.toFixed(1)}/10</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* CTA Buttons Row */}
            <tr className="border-t border-border-emphasis bg-secondary/20">
              <td className="sticky left-0 z-10 w-[180px] min-w-[180px] bg-secondary/90 border-r border-border p-4 font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Purchase Options
              </td>
              {products.map((product) => {
                const cta = product.ctaLinks?.[0] || { label: "Check Price", url: `/reviews/${product.slug}` };
                return (
                  <td key={`cta-${product.id}`} className="p-4 text-center">
                    <a
                      href={cta.url}
                      target={cta.url.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-sans text-xs font-semibold px-4 py-2 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] active:translate-y-[0px] shadow-sm transition-all duration-150 w-full max-w-[140px]"
                    >
                      <span>{cta.label}</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
