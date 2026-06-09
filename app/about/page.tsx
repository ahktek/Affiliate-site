import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "About Us | Editorial Rigor & Software Reviews | Chronicle",
  description: "Learn about Chronicle's mission, our hands-on testing standards, our team of developers and writers, and our commitment to editorial independence.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[800px] mx-auto px-6 w-full">
        {/* Editorial Bylines & Page Header */}
        <div className="border-b border-border pb-8 mb-10 space-y-4">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.1em] text-[#C8502A]">
            EDITORIAL MANIFESTO
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight text-foreground">
            About Chronicle
          </h1>
          <p className="font-serif italic text-lg md:text-xl text-muted-foreground leading-relaxed">
            &ldquo;We did the research so you don't have to.&rdquo;
          </p>
          <div className="flex items-center gap-3 pt-2 font-mono text-xs text-muted-foreground">
            <span>By The Editorial Board</span>
            <span>•</span>
            <span>Updated June 2026</span>
          </div>
        </div>

        {/* Article Content Area */}
        <article className="space-y-8 font-serif text-[1.0625rem] leading-[1.78] text-[#1A1A18] dark:text-zinc-300">
          <p>
            Chronicle was founded in 2024 out of frustration with the state of software reviews online. 
            The internet is flooded with low-quality content, sponsored listicles, and search-optimized 
            summaries created by writers who have never opened the products they review.
          </p>
          
          <p>
            We believe you deserve better. Whether you are looking for an AI-powered code assistant to 
            improve your coding velocity, an image generator for campaign assets, or an audio voice-cloning 
            suite for your podcast, we run the tests to give you clear, empirical rankings.
          </p>

          <h2 className="font-display font-semibold text-2xl text-foreground pt-4 leading-snug">
            Our Editorial Integrity
          </h2>
          <p>
            Our reviews are strictly independent. We do not accept sponsored content, and no company can pay 
            us to boost their tool's score or alter our final verdict. If a tool is slow, memory-heavy, or 
            overpriced, we will say so.
          </p>

          <h2 className="font-display font-semibold text-2xl text-foreground pt-4 leading-snug">
            Our Testing Methodology
          </h2>
          <p>
            We spend an average of 10 to 15 hours testing each product before publishing our scores. 
            Our evaluations focus on five core dimensions, each graded on a strict 1-10 scale:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-sans text-sm text-[#1A1A18] dark:text-zinc-300">
            <li><strong>Accuracy:</strong> Does the tool deliver on its claims without error or major hallucinations?</li>
            <li><strong>Speed:</strong> How fast does the software process queries, generate code, or compile scripts?</li>
            <li><strong>Ease of Use:</strong> Is the interface clean, accessible, and quick to integrate into existing workflows?</li>
            <li><strong>Value:</strong> Is the subscription pricing reasonable compared to open-source or cheaper alternatives?</li>
            <li><strong>Overall Score:</strong> A blended rating reflecting our editors' comprehensive workflow experience.</li>
          </ul>

          <h2 className="font-display font-semibold text-2xl text-foreground pt-4 leading-snug">
            Affiliate Disclosure
          </h2>
          <p>
            To keep our reviews free for everyone, we use affiliate links. When you click our links to visit a 
            software site and buy a subscription, we may earn a small referral commission. This commission comes 
            at no extra cost to you.
          </p>
          <p>
            Critically, we only use affiliate links for products we genuinely recommend or evaluate. Our editorial 
            team operates independently from our affiliate relationships to guarantee unbiased ratings.
          </p>

          <div className="border-t border-border pt-8 mt-12 text-center">
            <h3 className="font-display font-semibold text-lg text-foreground mb-3">
              Have Questions or Feedback?
            </h3>
            <p className="font-sans text-xs text-muted-foreground max-w-md mx-auto mb-4">
              If you have suggestions for tools we should benchmark next, or disagree with a rating, we would love to hear from you.
            </p>
            <a
              href="mailto:editorial@ahktek.com"
              className="inline-block bg-[#C8502A] text-white font-sans text-xs font-semibold px-5 py-2.5 rounded-[4px] hover:bg-[#A83E1F] transition-all"
            >
              Contact the Editors
            </a>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
