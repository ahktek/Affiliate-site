"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCompareStore, CompareItem } from "@/lib/store/compareStore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Search, 
  Layers, 
  Trash2, 
  Share2, 
  Star, 
  X, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  official_url: string;
  affiliate_url: string;
  logo_url: string;
  screenshot_urls: string[];
  category: string;
  status: string;
  pricing_model: string;
  has_free_tier: boolean;
  starting_price: string;
  api_available: boolean;
  overall_score: number;
  accuracy_score: number;
  speed_score: number;
  ease_of_use_score: number;
  value_score: number;
  best_for: string[];
  integrations: string[];
  context_window: string;
  pros: string[];
  cons: string[];
  limitations: string;
  verdict: string;
  verdict_summary: string;
  created_at: string;
  view_count: number;
}

interface CompareClientProps {
  initialTools: any[];
}

function CompareClientContent({ initialTools }: CompareClientProps) {
  const { items, addItem, removeItem, clearItems } = useCompareStore();
  const searchParams = useSearchParams();

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Highest Rated");
  const [copied, setCopied] = useState(false);

  // Synchronize URL query params on load
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const idList = ids.split(",");
      const toolsToLoad = initialTools.filter(t => idList.includes(t.id));
      if (toolsToLoad.length > 0) {
        useCompareStore.setState({
          items: toolsToLoad.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            logoUrl: t.logo_url,
            category: t.category,
            overallScore: Number(t.overall_score) || 0,
          }))
        });
      }
    }
  }, [searchParams, initialTools]);

  // Filters mapping
  const filterPills = [
    "All", "Free", "Freemium", "Paid", "Has API", 
    "No-Code Friendly", "Best for Writing", "Best for Code", "Best for Images"
  ];

  // Filtering Logic
  const filteredTools = useMemo(() => {
    return initialTools.filter(tool => {
      // Search term match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(query);
        const matchesTagline = tool.tagline?.toLowerCase().includes(query);
        const matchesCat = tool.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesTagline && !matchesCat) return false;
      }

      // Filter pills match
      if (activeFilter === "All") return true;
      if (activeFilter === "Free") return tool.pricing_model === "free";
      if (activeFilter === "Freemium") return tool.pricing_model === "freemium";
      if (activeFilter === "Paid") return tool.pricing_model === "paid" || tool.pricing_model === "enterprise";
      if (activeFilter === "Has API") return tool.api_available === true;
      
      if (activeFilter === "No-Code Friendly") {
        const hasZapier = tool.integrations?.some((i: string) => i.toLowerCase().includes("zapier") || i.toLowerCase().includes("no-code"));
        const easyToUse = Number(tool.ease_of_use_score) >= 8.5;
        return hasZapier || easyToUse;
      }
      
      if (activeFilter === "Best for Writing") {
        return tool.category === "Writing" || tool.best_for?.some((b: string) => b.toLowerCase().includes("writer") || b.toLowerCase().includes("blog"));
      }
      if (activeFilter === "Best for Code") {
        return tool.category === "Coding" || tool.best_for?.some((b: string) => b.toLowerCase().includes("developer") || b.toLowerCase().includes("engineer") || b.toLowerCase().includes("code"));
      }
      if (activeFilter === "Best for Images") {
        return tool.category === "Image Gen" || tool.best_for?.some((b: string) => b.toLowerCase().includes("designer") || b.toLowerCase().includes("artist") || b.toLowerCase().includes("image"));
      }

      return true;
    });
  }, [initialTools, searchQuery, activeFilter]);

  // Sorting Logic
  const sortedTools = useMemo(() => {
    const list = [...filteredTools];
    if (sortBy === "Highest Rated") {
      return list.sort((a, b) => Number(b.overall_score) - Number(a.overall_score));
    }
    if (sortBy === "Newest") {
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    if (sortBy === "Most Compared") {
      return list.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }
    if (sortBy === "Alphabetical") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [filteredTools, sortBy]);

  // Map compared items to full details
  const comparedDetails = useMemo(() => {
    return items.map(item => {
      const fullTool = initialTools.find(t => t.id === item.id);
      return {
        item,
        fullTool: fullTool as AIProduct | undefined
      };
    });
  }, [items, initialTools]);

  // Identify the winner ID (highest overall score)
  const winnerId = useMemo(() => {
    if (items.length < 2) return null;
    let highestScore = -1;
    let winner = null;
    items.forEach(item => {
      if (item.overallScore > highestScore) {
        highestScore = item.overallScore;
        winner = item.id;
      }
    });
    return winner;
  }, [items]);

  // Share URL Generator
  const handleShare = () => {
    if (items.length === 0) return;
    const idsParam = items.map(i => i.id).join(",");
    const shareUrl = `${window.location.origin}/compare?ids=${idsParam}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreBar = (score: number) => {
    const pct = Math.min(Math.max(score * 10, 0), 100);
    return (
      <div className="space-y-1 w-full">
        <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>Score</span>
          <span className="font-bold text-foreground">{score.toFixed(1)}/10</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500" 
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-20 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 mb-12 gap-6">
          <div>
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-primary block mb-2">
              COMPARE ENGINE
            </span>
            <h1 className="font-display font-bold text-3xl md:text-[2.75rem] leading-none text-foreground">
              Matchup Matrix
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed max-w-xl">
              Compare up to 3 AI tools head-to-head. Select products from the directory below or filter by features.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={clearItems}
                className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-destructive transition-colors border border-border rounded-[6px] px-3.5 py-2.5 bg-card"
              >
                <Trash2 size={13} />
                <span>Clear Selection</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 font-sans text-xs bg-primary text-primary-foreground font-semibold rounded-[6px] px-4 py-2.5 hover:bg-accent-hover transition-colors shadow-sm"
              >
                <Share2 size={13} />
                <span>{copied ? "Copied Link!" : "Share Matchup"}</span>
              </button>
            </div>
          )}
        </div>

        {/* BROWSE ALL / DIRECTORY SECTION */}
        <section className="space-y-8 mb-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search tools or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full font-sans text-sm bg-transparent border border-border rounded-[6px] pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-foreground placeholder-muted-foreground/60"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
              <span className="font-sans text-xs text-muted-foreground whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="font-sans text-xs bg-transparent border border-border rounded-[6px] px-3 py-2.5 focus:outline-none focus:border-primary transition-colors text-foreground"
              >
                <option value="Highest Rated">Highest Rated</option>
                <option value="Newest">Newest</option>
                <option value="Most Compared">Most Compared</option>
                <option value="Alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-hide">
            {filterPills.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-sans text-[0.7rem] uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border-emphasis"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Tools Grid */}
          {sortedTools.length === 0 ? (
            <div className="text-center py-20 bg-secondary/30 border border-border rounded-[6px] max-w-md mx-auto">
              <p className="font-body text-muted-foreground text-sm">No tools found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                className="text-primary font-sans text-xs font-semibold mt-3 hover:underline"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedTools.map((tool) => {
                const isInCompare = items.some((i) => i.id === tool.id);
                return (
                  <div
                    key={tool.id}
                    className={`bg-card border rounded-[6px] p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-sm ${
                      isInCompare ? "border-primary ring-1 ring-primary/20 bg-primary/[0.01]" : "border-border hover:border-border-emphasis"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="relative w-12 h-12 rounded-[6px] overflow-hidden bg-secondary border border-border">
                          <Image
                            src={tool.logo_url || "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=100"}
                            alt={tool.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 text-primary font-mono text-xs font-bold px-2 py-0.5 rounded-[4px]">
                          ★ {Number(tool.overall_score).toFixed(1)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-[0.65rem] uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary border border-border rounded-full">
                            {tool.category}
                          </span>
                          <span className="font-sans text-[10px] uppercase font-semibold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-[4px]">
                            {tool.pricing_model}
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
                              logoUrl: tool.logo_url,
                              category: tool.category,
                              overallScore: Number(tool.overall_score) || 0,
                            });
                          }
                        }}
                        className={`flex-1 font-sans text-xs font-semibold px-4 py-2 rounded-[6px] transition-all flex items-center justify-center gap-1.5 ${
                          isInCompare
                            ? "bg-primary text-primary-foreground"
                            : "bg-transparent text-foreground border border-border hover:border-primary"
                        }`}
                      >
                        {isInCompare ? (
                          <>
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <Layers size={13} />
                            <span>Add to Compare</span>
                          </>
                        )}
                      </button>
                      <Link
                        href={`/reviews/${tool.slug}`}
                        className="font-sans text-xs font-semibold bg-secondary hover:bg-border/30 text-foreground border border-border px-4 py-2 rounded-[6px] text-center transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* COMPARISON SPEC TABLE */}
        <section className="pt-8 border-t border-border">
          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-foreground">
              Comparison Table
            </h2>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {items.length === 0 
                ? "Choose 2 or 3 tools from the directory above to display detailed matchup specs." 
                : `${items.length} tool(s) active. Add at least ${Math.max(0, 2 - items.length)} more.`}
            </p>
          </div>

          {items.length < 2 ? (
            <div className="text-center py-20 bg-secondary/20 border border-dashed border-border rounded-[6px]">
              <Layers size={32} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="font-body text-sm text-muted-foreground">Select at least 2 tools to start comparing side-by-side.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border rounded-[6px] bg-card shadow-sm">
              <table className="w-full border-collapse table-fixed text-left min-w-[600px]">
                
                {/* Sticky Header Row (Freezes under the navbar) */}
                <thead className="sticky top-20 z-20 bg-card border-b border-border shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                  <tr>
                    <th className="w-[180px] p-4 bg-secondary/50 font-sans text-xs font-semibold text-muted-foreground">
                      Specs Matchup
                    </th>
                    {comparedDetails.map(({ item, fullTool }) => {
                      const isWinner = item.id === winnerId;
                      return (
                        <th 
                          key={item.id} 
                          className={`p-4 relative min-w-[160px] ${
                            isWinner ? "border-t-2 border-primary" : ""
                          }`}
                        >
                          {isWinner && (
                            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground font-sans text-[9px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                              <Award size={10} />
                              <span>Best Pick</span>
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8 rounded-[4px] overflow-hidden bg-background border border-border">
                                <Image
                                  src={item.logoUrl || "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=100"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-display font-semibold text-sm text-foreground leading-tight truncate max-w-[120px]">
                                {item.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
                              aria-label={`Remove ${item.name}`}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border text-xs font-sans">
                  
                  {/* Row 1: Overall Score */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Overall Score</td>
                    {comparedDetails.map(({ item }) => {
                      const isWinner = item.id === winnerId;
                      return (
                        <td key={item.id} className="p-4">
                          <div className="flex items-baseline gap-1">
                            <span className={`font-display font-extrabold text-2xl ${
                              isWinner ? "text-primary font-bold" : "text-foreground"
                            }`}>
                              {Number(item.overallScore).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">/10</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 2: Pricing Model */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Pricing Model</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4 capitalize font-semibold">
                        {fullTool?.pricing_model || "paid"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Starting Price */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Starting Price</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4 font-body">
                        {fullTool?.starting_price || "$0"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Free Tier Available */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Free Tier Available</td>
                    {comparedDetails.map(({ item, fullTool }) => {
                      const hasFree = fullTool?.has_free_tier;
                      return (
                        <td key={item.id} className={`p-4 font-bold ${
                          hasFree ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {hasFree ? "Yes" : "No"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 5: API Access */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">API Access</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        {fullTool?.api_available ? "Yes (Developer API)" : "No"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Accuracy Score */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Accuracy Score</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        {fullTool ? scoreBar(Number(fullTool.accuracy_score) || 0) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Speed Score */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Speed Score</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        {fullTool ? scoreBar(Number(fullTool.speed_score) || 0) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 8: Ease of Use */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Ease of Use</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        {fullTool ? scoreBar(Number(fullTool.ease_of_use_score) || 0) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 9: Value for Money */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Value for Money</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        {fullTool ? scoreBar(Number(fullTool.value_score) || 0) : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 10: Best For */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Best For</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {fullTool?.best_for?.map((tag: string) => (
                            <span key={tag} className="bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded-[4px] font-sans">
                              {tag}
                            </span>
                          )) || "—"}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 11: Integrations */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Integrations</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {fullTool?.integrations?.map((tag: string) => (
                            <span key={tag} className="bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded-[4px] font-sans">
                              {tag}
                            </span>
                          )) || "—"}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 12: Context Window */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Context Window</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4 font-body">
                        {fullTool?.context_window || "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 13: Limitations */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Limitations</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4 text-muted-foreground font-body leading-relaxed max-w-[200px] truncate" title={fullTool?.limitations || ""}>
                        {fullTool?.limitations || "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Row 14: Verdict */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Verdict</td>
                    {comparedDetails.map(({ item, fullTool }) => {
                      const verd = fullTool?.verdict || "consider";
                      let colorClass = "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800";
                      if (verd === "highly-recommended") colorClass = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800/50";
                      if (verd === "recommended") colorClass = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/50";
                      if (verd === "consider") colorClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/50";
                      if (verd === "skip") colorClass = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/50";
                      return (
                        <td key={item.id} className="p-4">
                          <span className={`px-2.5 py-1 rounded-[4px] uppercase text-[10px] font-semibold tracking-wider border ${colorClass}`}>
                            {verd.replace("-", " ")}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row 15: Actions */}
                  <tr>
                    <td className="p-4 font-semibold bg-secondary/30 text-muted-foreground">Actions</td>
                    {comparedDetails.map(({ item, fullTool }) => (
                      <td key={item.id} className="p-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/reviews/${item.slug}`}
                            className="bg-secondary hover:bg-border/30 text-foreground font-sans text-xs font-semibold py-2 px-3 rounded-[6px] text-center border border-border transition-all w-full"
                          >
                            Read Full Review
                          </Link>
                          {fullTool?.affiliate_url && (
                            <a
                              href={`/go/${item.slug}`}
                              target="_blank"
                              rel="sponsored noopener"
                              className="bg-primary hover:bg-accent-hover text-primary-foreground font-sans text-xs font-semibold py-2 px-3 rounded-[6px] text-center transition-all flex items-center justify-center gap-1.5 w-full shadow-sm"
                            >
                              <span>Official Site</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CompareClient({ initialTools }: CompareClientProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <span className="font-sans text-sm text-muted-foreground animate-pulse">Loading comparison engine...</span>
      </div>
    }>
      <CompareClientContent initialTools={initialTools} />
    </Suspense>
  );
}
