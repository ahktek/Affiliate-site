"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompareStore } from "@/lib/store/compareStore";
import { X, ArrowRight, Layers, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function CompareTray() {
  const { items, removeItem, clearItems } = useCompareStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0 || pathname === "/compare") {
    return null;
  }

  const idsParam = items.map(i => i.id).join(",");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-8px_32px_rgba(26,26,24,0.08)] py-4 px-6 md:px-12 transition-colors duration-300"
      >
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Heading and count */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-[4px]">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-foreground">
                Comparison Tray
              </h4>
              <p className="font-body text-xs text-muted-foreground">
                {items.length} of 3 items selected
              </p>
            </div>
          </div>

          {/* Center: Selected thumbnails */}
          <div className="flex flex-wrap items-center gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-secondary border border-border rounded-[6px] pl-2 pr-1 py-1 hover:border-border-emphasis transition-all"
              >
                <div className="relative w-6 h-6 rounded-[3px] overflow-hidden bg-background border border-border">
                  <Image
                    src={item.featuredImage || item.logoUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-sans text-[0.8rem] font-medium text-foreground max-w-[80px] md:max-w-[120px] truncate">
                  {item.name}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-border/50"
                  aria-label={`Remove ${item.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: CTA Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={clearItems}
              className="flex items-center gap-1 font-sans text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-2"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>

            {items.length >= 2 ? (
              <Link
                href={`/compare?ids=${idsParam}`}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-sans text-xs font-semibold px-4 py-2.5 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] active:translate-y-[0px] shadow-sm transition-all"
              >
                <span>Compare Now</span>
                <ArrowRight size={13} />
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 bg-border text-muted-foreground font-sans text-xs font-semibold px-4 py-2.5 rounded-[6px] cursor-not-allowed"
                title="Add at least 2 items to compare"
              >
                <span>Compare Now</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
