import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | Optura Vibe",
  description: "Read Optura Vibe's policies on cookies, newsletter registration, analytics tracking, and data security.",
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            Effective Date: June 2026
          </p>
        </div>

        {/* Content */}
        <article className="space-y-6 font-serif text-[1.0625rem] leading-[1.78] text-[#1A1A18] dark:text-zinc-300">
          <p>
            At Optura Vibe (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), we respect your privacy and are committed to protecting it. This Privacy Policy describes how we collect, use, and share information when you visit our website located at ahktek.com (the &ldquo;Site&rdquo;).
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            1. Information We Collect
          </h2>
          <p>
            We collect information from you in the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-1 font-sans text-sm">
            <li><strong>Email Newsletter:</strong> If you subscribe to our newsletter, we collect your email address.</li>
            <li><strong>Usage Logs:</strong> We collect general analytics information (such as browser type, pages viewed, time spent) using privacy-friendly logging utilities to optimize layout speed and content relevancy.</li>
            <li><strong>Cookies:</strong> We use basic security and theme preference cookies to store your selected dark/light mode preference.</li>
          </ul>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            2. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-1 font-sans text-sm">
            <li>Deliver weekly editorial newsletters (if subscribed).</li>
            <li>Monitor and analyze traffic patterns, click-through rates, and comparison selections to improve our directory tool list.</li>
            <li>Prevent fraudulent signups and secure our website systems.</li>
          </ul>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            3. Sharing of Information
          </h2>
          <p>
            We do not sell, rent, or trade your personal data. We may share information with trusted third-party service providers (such as Resend for email distribution or Supabase for secure cloud storage) who assist us in operating our Site.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            4. Affiliate Link Notice
          </h2>
          <p>
            Our site displays outbound affiliate links to third-party software websites. When you click these links, cookie tracking may be applied by the merchant network to record referral sales. These third-party sites operate under their own independent privacy policies.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            5. Your Rights & Choice
          </h2>
          <p>
            You can unsubscribe from our newsletter at any time by clicking the &ldquo;unsubscribe&rdquo; link at the bottom of any email we send.
          </p>

          <h2 className="font-display font-semibold text-xl text-foreground pt-3 leading-snug">
            6. Contact Us
          </h2>
          <p>
            If you have questions about this policy, please reach out to us at <a href="mailto:privacy@ahktek.com" className="text-primary hover:underline">privacy@ahktek.com</a>.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
