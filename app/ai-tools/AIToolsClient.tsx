"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Check, X, ShieldAlert, Star, RefreshCw } from "lucide-react";
import { useCompareStore } from "@/lib/store/compareStore";

interface AIToolsClientProps {
  initialTools: any[];
}

export default function AIToolsClient({ initialTools }: AIToolsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("score-desc"); // 'score-desc' | 'name-asc' | 'price-asc'

  // Zustand compare store
  const compareItems = useCompareStore((state) => state.items);
  const addItem = useCompareStore((state) => state.addItem);
  const removeItem = useCompareStore((state) => state.removeItem);

  // Categories list
  const categories = ["All", "Coding", "Writing", "Image Gen", "Video", "Audio", "Productivity", "Research", "Other"];

  // Compute counts for category badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: initialTools.length };
    categories.forEach((cat) => {
      if (cat !== "All") {
        counts[cat] = initialTools.filter((t) => t.category === cat).length;
      }
    });
    return counts;
  }, [initialTools]);

  // Filter and Sort tools
  const filteredAndSortedTools = useMemo(() => {
    let result = [...initialTools];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline?.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.verdict_summary?.toLowerCase().includes(q) ||
          t.pros?.some((p: string) => p.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "score-desc") {
        return (Number(b.overall_score) || 0) - (Number(a.overall_score) || 0);
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "price-asc") {
        // Simple mapping for pricing model order: free < freemium < paid
        const priceOrder = (p: string) => {
          if (p === "free") return 0;
          if (p === "freemium") return 1;
          if (p === "paid") return 2;
          return 3;
        };
        return priceOrder(a.pricing_model) - priceOrder(b.pricing_model);
      }
      return 0;
    });

    return result;
  }, [initialTools, searchQuery, selectedCategory, sortBy]);

  const toggleCompare = (tool: any) => {
    const isCompared = compareItems.some((item) => item.id === tool.id);
    if (isCompared) {
      removeItem(tool.id);
    } else {
      addItem({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        logoUrl: tool.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150",
        category: tool.category,
        overallScore: Number(tool.overall_score) || 0,
      });
    }
  };

  // Verdict design utility
  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case "highly-recommended":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "recommended":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "consider":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "skip":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    }
  };

  const getVerdictLabel = (verdict: string) => {
    if (verdict === "highly-recommended") return "Highly Recommended";
    return verdict.charAt(0).toUpperCase() + verdict.slice(1);
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center border-b border-border pb-6">
        {/* Category Pill Tabs */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {categories.map((cat) => {
            const count = categoryCounts[cat] || 0;
            // Skip categories with 0 tools to keep list clean (unless it is "All")
            if (cat !== "All" && count === 0) return null;
            
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`font-sans text-xs px-3.5 py-2 rounded-[6px] border font-medium transition-all ${
                  isSelected
                    ? "bg-[#C8502A] text-white border-transparent"
                    : "bg-[#FAFAF7] dark:bg-[#1A1A18] text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat} <span className={`ml-1 text-[10px] ${isSelected ? "text-white/80" : "text-muted-foreground/60"}`}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Panel */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools, pros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAF7] dark:bg-[#1A1A18] border border-border rounded-[6px] pl-9 pr-4 py-2 font-sans text-sm focus:outline-none focus:border-primary/50 text-foreground"
            />
          </div>

          {/* Sort Select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto bg-[#FAFAF7] dark:bg-[#1A1A18] border border-border rounded-[6px] px-3.5 py-2 font-sans text-xs font-semibold appearance-none pr-8 cursor-pointer focus:outline-none text-foreground"
            >
              <option value="score-desc">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="price-asc">Pricing (Free first)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredAndSortedTools.length === 0 ? (
        <div className="text-center py-20 bg-[#FAFAF7] dark:bg-[#1A1A18] border border-border rounded-[6px] flex flex-col items-center justify-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-muted-foreground" />
          <h3 className="font-display font-semibold text-lg text-foreground">No AI tools match your criteria</h3>
          <p className="font-body text-sm text-muted-foreground max-w-sm">
            Try adjusting your search filters, query keywords, or category selection to find matching software.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSortBy("score-desc");
            }}
            className="font-sans text-xs font-semibold px-4 py-2 bg-primary text-white rounded-[6px] hover:bg-accent-hover transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTools.map((tool) => {
            const isCompared = compareItems.some((item) => item.id === tool.id);
            const scoreNum = Number(tool.overall_score) || 0;

            return (
              <div
                key={tool.id}
                className="bg-card border border-border rounded-[6px] p-5 hover:border-primary/45 transition-all duration-300 flex flex-col justify-between group h-full hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {/* Tool Logo */}
                      <div className="relative w-12 h-12 rounded-[6px] border border-border overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                          src={tool.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150"}
                          alt={tool.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      
                      {/* Name and Tagline */}
                      <div>
                        <span className="font-sans text-[10px] font-bold text-[#C8502A] uppercase tracking-wider">
                          {tool.category}
                        </span>
                        <h3 className="font-display font-semibold text-base text-foreground mt-0.5 leading-snug">
                          {tool.name}
                        </h3>
                      </div>
                    </div>

                    {/* Overall Rating Display */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-500 px-2 py-0.5 rounded-[4px] border border-amber-500/25">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-mono text-xs font-bold">{scoreNum.toFixed(1)}</span>
                      </div>
                      <span className="font-sans text-[8px] text-muted-foreground uppercase mt-0.5 tracking-wider">
                        Overall Score
                      </span>
                    </div>
                  </div>

                  {/* Verdict Badge */}
                  {tool.verdict && (
                    <div className={`inline-block border px-2.5 py-0.5 rounded-[4px] font-sans text-[10px] font-bold uppercase tracking-wider ${getVerdictStyle(tool.verdict)}`}>
                      {getVerdictLabel(tool.verdict)}
                    </div>
                  )}

                  {/* Tagline */}
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {tool.tagline}
                  </p>

                  {/* Key Specs Info */}
                  <div className="bg-[#FAFAF7] dark:bg-[#1A1A18]/60 p-3 rounded-[4px] border border-border space-y-1.5 font-sans text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pricing:</span>
                      <span className="font-semibold text-foreground uppercase tracking-wide text-[10px]">{tool.pricing_model} ({tool.starting_price || "Free"})</span>
                    </div>
                    {tool.context_window && tool.context_window !== "N/A" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Context Size:</span>
                        <span className="font-semibold text-foreground">{tool.context_window}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Status:</span>
                      <span className="font-semibold text-foreground">{tool.api_available ? "Available" : "No SDK"}</span>
                    </div>
                  </div>

                  {/* Pros Bullet List */}
                  {tool.pros && tool.pros.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-border/80">
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Key Pros
                      </span>
                      <ul className="space-y-1">
                        {tool.pros.slice(0, 3).map((pro: string, pIdx: number) => (
                          <li key={pIdx} className="flex items-start gap-1.5 font-body text-xs text-[#1A1A18] dark:text-zinc-300">
                            <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex flex-col gap-2 pt-5 border-t border-border/80 mt-5">
                  <div className="flex gap-2">
                    {/* Compare Button */}
                    <button
                      onClick={() => toggleCompare(tool)}
                      className={`flex-1 flex items-center justify-center gap-1.5 font-sans text-xs font-semibold py-2.5 rounded-[4px] border transition-all ${
                        isCompared
                          ? "bg-amber-600/10 text-amber-700 dark:text-amber-500 border-amber-500/30 hover:bg-amber-600/20"
                          : "bg-transparent text-foreground border-border hover:bg-secondary"
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isCompared ? "animate-spin-slow text-amber-600" : ""}`} />
                      <span>{isCompared ? "In Tray" : "Compare"}</span>
                    </button>

                    {/* Official Site CTA */}
                    {tool.official_url && (
                      <a
                        href={`/go/${tool.slug}`}
                        target="_blank"
                        rel="sponsored noopener"
                        className="flex-1 text-center font-sans text-xs font-semibold py-2.5 rounded-[4px] bg-[#C8502A] text-white hover:bg-[#A83E1F] transition-colors border border-transparent shadow-sm"
                      >
                        Visit Site
                      </a>
                    )}
                  </div>

                  {/* Read Review Link */}
                  {tool.review_content && (
                    <Link
                      href={`/reviews/${tool.slug}`}
                      className="text-center font-sans text-xs font-semibold py-2 rounded-[4px] border border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
                    >
                      Read Our Full Review
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
