"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/context/AuthContext";
import { useCompareStore } from "@/lib/store/compareStore";
import { Search, Sun, Moon, Menu, X, LogOut, Settings, Layers } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  
  // Zustand compare tray items count
  const compareItems = useCompareStore((state) => state.items);
  const compareCount = compareItems.length;

  // Scroll link hook calculations using Framer Motion
  const { scrollY } = useScroll();
  
  // Scroll threshold is 60px
  // Interpolate background opacity from 0 to 0.95, and border opacity from 0 to 1
  const headerBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(250,250,247,0)", "rgba(250,250,247,0.95)"]
  );
  
  const headerBgDark = useTransform(
    scrollY,
    [0, 60],
    ["rgba(20,20,18,0)", "rgba(20,20,18,0.95)"]
  );

  const headerBorderColor = useTransform(
    scrollY,
    [0, 60],
    ["rgba(228,227,220,0)", "rgba(228,227,220,1)"]
  );

  const headerBorderColorDark = useTransform(
    scrollY,
    [0, 60],
    ["rgba(46,46,42,0)", "rgba(46,46,42,1)"]
  );

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Reviews", href: "/reviews" },
    { label: "Compare", href: "/compare" },
    { label: "Tools", href: "/ai-tools" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -100 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          backgroundColor: resolvedTheme === "dark" ? headerBgDark : headerBg,
          borderBottomColor: resolvedTheme === "dark" ? headerBorderColorDark : headerBorderColor,
        }}
        className="sticky top-0 z-50 w-full border-b transition-all duration-300 backdrop-filter backdrop-blur-md"
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-20 h-20 flex items-center justify-between">
          {/* Logo - Typography wordmark in Lora 700 */}
          <Link href="/" className="font-display font-bold text-2xl tracking-tight text-foreground max-w-[150px] select-none hover:opacity-90 transition-opacity">
            CHRONICLE
          </Link>

          {/* Desktop Nav Items - Instrument Sans */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-sans text-[0.875rem] font-medium tracking-wide transition-colors duration-200 nav-link-underline py-1 flex items-center gap-1.5 ${
                    isActive
                      ? "text-primary after:scale-x-100"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.href === "/compare" && compareCount > 0 && (
                    <span className="w-4 h-4 bg-primary text-primary-foreground font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {compareCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-sans text-[0.875rem] font-medium tracking-wide text-primary hover:text-accent-hover transition-colors py-1 flex items-center gap-1"
              >
                <Settings size={14} /> Admin
              </Link>
            )}
          </nav>

          {/* Right Side UI - Search + Tray Count + Theme + CTAs */}
          <div className="hidden md:flex items-center space-x-5">
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
                    placeholder="Search..."
                    className="font-sans text-[0.875rem] px-3 py-1 bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary w-40 text-foreground"
                    autoFocus
                  />
                  <button type="submit" className="p-2 text-muted-foreground hover:text-foreground">
                    <Search size={17} />
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
                  <Search size={17} />
                </button>
              )}
            </div>

            {/* Compare Floating Count Badge (Hidden when 0) */}
            {compareCount > 0 && (
              <Link
                href="/compare"
                className="relative p-2 text-muted-foreground hover:text-foreground transition-all duration-200"
                title="Go to Comparison Engine"
              >
                <Layers size={17} />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-background shadow-sm">
                  {compareCount}
                </span>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center space-x-1.5 px-2.5 py-1 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {resolvedTheme === "dark" ? (
                <>
                  <Sun size={14} className="text-primary" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-primary" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Admin/User CTAs */}
            {user ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 font-sans text-[0.875rem] font-medium text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut size={14} /> Sign Out
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
              {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Fullscreen Overlay - Lora & Instrument Sans */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 bg-[#FAFAF7] dark:bg-[#141412] flex flex-col justify-center items-center p-8"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground"
              aria-label="Close menu"
            >
              <X size={26} />
            </button>

            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center space-y-6 text-center"
            >
              {navItems.map((item) => (
                <motion.div key={item.href} variants={itemVariants}>
                  <Link
                    href={item.href}
                    className="font-display font-bold text-[2rem] text-[#1A1A18] dark:text-[#F0EFEA] hover:text-primary transition-colors duration-200 flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.href === "/compare" && compareCount > 0 && (
                      <span className="text-sm bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold">
                        {compareCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              
              {isAdmin && (
                <motion.div variants={itemVariants}>
                  <Link
                    href="/admin"
                    className="font-display font-bold text-[2rem] text-primary hover:text-accent-hover transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="h-[1px] w-24 bg-border my-4" />

              <motion.div variants={itemVariants}>
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-sans text-[1.1rem] font-medium text-destructive"
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
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
