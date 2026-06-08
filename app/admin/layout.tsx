"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Folder, 
  Users, 
  LogOut, 
  BarChart3, 
  Layers, 
  Sliders, 
  Settings 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else if (user && !isAdmin && pathname !== "/admin/login") {
        // Option: Show forbidden page or redirect
        // router.push("/");
      }
    }
  }, [user, loading, isAdmin, pathname, router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Allow rendering login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return <div className="flex h-screen items-center justify-center">Access Denied. Admins only.</div>;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "AI Tools", href: "/admin/ai-tools", icon: Layers },
    { name: "Hero Slides", href: "/admin/hero-slides", icon: Sliders },
    { name: "Categories", href: "/admin/categories", icon: Folder },
    { name: "Homepage Settings", href: "/admin/settings/homepage", icon: Settings },
    { name: "Subscribers", href: "/admin/subscribers", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-[#FAFAF9] text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A18] text-white/95 border-r border-[#2E2E2A] flex flex-col font-sans">
        <div className="h-16 flex items-center px-6 border-b border-[#2E2E2A]">
          <span className="text-lg font-bold font-display tracking-tight text-white select-none">
            CHRONICLE ADMIN
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs uppercase tracking-wider ${
                  isActive 
                    ? "bg-[#252521] text-white font-semibold shadow-sm border-l-2 border-primary" 
                    : "text-zinc-400 hover:bg-[#252521]/50 hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#2E2E2A]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-zinc-400 hover:bg-[#252521]/50 hover:text-white transition-all text-xs uppercase tracking-wider"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-white">
        {children}
      </main>
    </div>
  );
}
