import React from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIToolsClient from "./AIToolsClient";

export const revalidate = 600; // Cache for 10 minutes

export const metadata = {
  title: "AI Tools Directory | Hand-Tested Reviews & Ratings | Chronicle",
  description: "Browse our database of the best AI tools for coding, writing, image generation, research, and video editing, complete with performance scores and direct specs.",
};

export default async function AIToolsDirectoryPage() {
  let tools: any[] = [];
  
  try {
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("status", "published")
      .order("name", { ascending: true });
      
    tools = data || [];
  } catch (err) {
    console.error("Error loading tools for listing page:", err);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[1280px] mx-auto px-6 md:px-20 w-full">
        {/* Page Header */}
        <div className="max-w-[680px] mb-12 md:mb-16 space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-primary block">
            CURATED DIRECTORY
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-foreground">
            Hand-Tested AI Tools
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            We bypass sponsored claims to run rigorous benchmarks on ease-of-use, performance, value, and speed. Filter and search below to find your fit.
          </p>
        </div>

        {/* Client-side directory list */}
        <AIToolsClient initialTools={tools} />
      </main>

      <Footer />
    </div>
  );
}
