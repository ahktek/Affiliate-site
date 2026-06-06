"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary border-t border-border mt-20 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-6 md:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Logo and About Section (6 cols) */}
          <div className="md:col-span-6 space-y-6">
            <Link href="/" className="font-display font-bold text-2xl tracking-tight text-foreground select-none">
              CHRONICLE
            </Link>
            <p className="font-body text-sm text-muted-foreground max-w-md leading-relaxed">
              We conduct thorough, independent, and research-oriented reviews of AI tools, SaaS platforms, and digital products. 
              Our writers build tests and compile data so that you can make confident, informed buying decisions.
            </p>
          </div>

          {/* Quick Links / Taxonomy (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-xs font-semibold tracking-wider text-foreground uppercase">
              Publication
            </h4>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Homepage
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-muted-foreground hover:text-foreground transition-colors">
                  Product Reviews
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Editorial Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-sans text-xs font-semibold tracking-wider text-foreground uppercase">
              Disclosure & Policies
            </h4>
            <ul className="space-y-2 font-sans text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider line */}
        <div className="h-[1px] bg-border-emphasis my-12" />

        {/* Affiliate Disclosure & Bottom Bar */}
        <div className="space-y-6">
          <div className="bg-background/50 border border-border p-5 rounded-[6px]">
            <span className="font-sans text-[0.7rem] font-semibold tracking-wider text-primary uppercase block mb-1">
              Affiliate Disclosure
            </span>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Chronicle is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no additional cost to you. 
              This support helps fund our independent research, product testing, and editorial integrity. Our reviews are based solely on our editors' hands-on experience and data-driven analysis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-sans pt-2">
            <p>© {currentYear} Chronicle. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">
              Designed with Warm Editorial Precision.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
