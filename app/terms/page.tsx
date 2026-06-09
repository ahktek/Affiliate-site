import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | Chronicle",
  description: "Read Chronicle's terms of service, affiliate disclosure, and website usage policies.",
};

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-12 md:py-20 max-w-[680px] mx-auto px-6 w-full">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8 space-y-3">
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            LEGAL STATEMENT
          </span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">
            Terms of Service
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Effective Date: June 2026
          </p>
        </div>

        {/* Content */}
        <article className="space-y-6 font-serif text-[1.0625rem] leading-[1.78] text-[#1A1A18] dark:text-zinc-300">
          <p>
            Welcome to Chronicle. By accessing or using our website located at ahktek.com (the &ldquo;Site&rdquo;), you agree to comply with and be bound by the following terms and conditions (the &ldquo;Terms&rdquo;).
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            1. Use of our Site
          </h2>
          <p>
            All content on this Site, including product reviews, comparison data matrices, blog columns, and software ratings, is for informational and educational purposes only. You may view and print articles for personal, non-commercial use only.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            2. Intellectual Property
          </h2>
          <p>
            The brand names, logos, editorial text reviews, and custom layouts are protected under copyright, trademark, and other proprietary laws. Copying, scraping, or republishing our content to compete with our Site is strictly prohibited.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            3. Disclaimer of Warranties
          </h2>
          <p>
            We test software carefully, but products change rapidly. We do not warrant that rating scores, feature descriptions, or starting prices are 100% accurate, complete, or up-to-date at the time of your reading. You should verify pricing, features, and system requirements on the official vendor website before subscribing.
          </p>
          <p>
            Your reliance on any reviews or comparison data found on our Site is solely at your own risk.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall Chronicle or its owners be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the Site, including business interruption, financial loss, or software configuration errors.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            5. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which our business is registered, without giving effect to conflicts of law principles.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            6. Changes to these Terms
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. We will post the revised terms with an updated &ldquo;Effective Date&rdquo; at the top.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            7. Contact Us
          </h2>
          <p>
            If you have questions about these Terms, please contact us at <a href="mailto:terms@ahktek.com" className="text-primary hover:underline">terms@ahktek.com</a>.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
