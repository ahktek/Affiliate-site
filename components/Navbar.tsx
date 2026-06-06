"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/context/AuthContext";
import { Search, Sun, Moon, Menu, X, LogOut, Settings } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  
  // Handle scroll class toggle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Reviews", href: "/reviews" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]"
            : "bg-background"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 h-20 flex items-center justify-between">
          {/* Logo - Typography wordmark in Lora 700 */}
          <Link href="/" className="font-display font-bold text-2xl tracking-tight text-foreground max-w-[150px] select-none hover:opacity-90 transition-opacity">
            CHRONICLE
          </Link>

          {/* Desktop Nav Items - Instrument Sans */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-sans text-[0.875rem] font-medium tracking-wide transition-colors duration-200 nav-link-underline py-1 ${
                  pathname === item.href
                    ? "text-primary after:scale-x-100"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-sans text-[0.875rem] font-medium tracking-wide text-primary hover:text-accent-hover transition-colors py-1 flex items-center gap-1"
              >
                <Settings size={14} /> Admin
              </Link>
            )}
          </nav>

          {/* Right Side UI - Search + Theme + CTAs */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search Bar Toggle */}
            <div className="relative flex items-center">
              {isSearchOpen ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/reviews?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reviews..."
                    className="font-sans text-[0.875rem] px-3 py-1 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-40"
                    autoFocus
                  />
                  <button type="submit" className="p-2 text-muted-foreground hover:text-foreground">
                    <Search size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs font-mono ml-1"
                  >
                    ESC
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center space-x-2 px-3 py-1 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun size={15} className="text-primary" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-primary" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Subscribe CTA */}
            {user ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 font-sans text-[0.875rem] font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            ) : (
              <Link
                href="/#newsletter"
                className="bg-primary text-primary-foreground font-sans text-[0.875rem] font-medium px-4 py-2 rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] active:translate-y-[0px] shadow-[0_4px_12px_rgba(200,80,42,0.15)] transition-all duration-200"
              >
                Subscribe
              </Link>
            )}
          </div>

          {/* Mobile Navigation Toggle Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Overlay - Lora & Instrument Sans */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background flex flex-col justify-center items-center p-8 animate-fade-in">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          <nav className="flex flex-col items-center space-y-8 text-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display font-medium text-[2rem] text-foreground hover:text-primary transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-display font-medium text-[2rem] text-primary hover:text-accent-hover transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            )}

            <div className="h-[1px] w-24 bg-border my-4" />

            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="font-sans text-[1rem] font-medium text-destructive"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/#newsletter"
                className="bg-primary text-primary-foreground font-sans text-[1rem] font-medium px-8 py-3 rounded-[6px] hover:bg-accent-hover transition-colors shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Subscribe
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
