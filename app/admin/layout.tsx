"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import Link from "next/link";
import { LayoutDashboard, FileText, Star, Folder, Users, LogOut, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center blueprint-grid bg-background">
        <div className="flex flex-col items-center gap-3 font-mono text-xs text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          ESTABLISHING CONSOLE LINK...
        </div>
      </div>
    );
  }

  // Allow rendering login page without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center blueprint-grid bg-background">
        <div className="bg-card border border-primary/20 rounded-xl p-8 max-w-sm text-center shadow-card font-mono text-xs space-y-4">
          <div className="w-4 h-4 bg-primary rounded-full animate-ping mx-auto shadow-led-pulse" />
          <div className="font-bold text-red-500">FAULT: ACCESS_DENIED</div>
          <p className="text-muted-foreground leading-relaxed">
            SYSTEM ATTEMPT LOGGED. SECURITY PRIVILEGES REQUIRED FOR CURRENT SECTOR.
          </p>
          <Button asChild size="sm" variant="default" className="mt-2">
            <Link href="/admin/login">RE-SIGN CONSOLE</Link>
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Categories", href: "/admin/categories", icon: Folder },
    { name: "Subscribers", href: "/admin/subscribers", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - styled as a brushed metal physical control console */}
      <aside className="w-64 bg-card border-r border-border/80 flex flex-col relative z-20 shrink-0 shadow-card">
        {/* Header containing system status */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              PANEL // LNK_OK
            </span>
          </div>
          <Sliders className="w-4 h-4 text-muted-foreground/60" />
        </div>

        {/* Navigation list styled as physical panel button grid */}
        <nav className="flex-1 p-4 space-y-3.5 overflow-y-auto">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block pl-2">
            CHANNELS
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-75 border ${
                  isActive
                    ? "bg-muted text-primary border-border/40 shadow-recessed translate-y-[1px] font-bold"
                    : "bg-card text-foreground border-white/60 shadow-card hover:bg-muted/30 hover:shadow-floating active:translate-y-[1px] active:shadow-pressed"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer containing the logout button */}
        <div className="p-4 border-t border-border/80 bg-muted/20">
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2.5 px-4 py-2.5 w-full rounded-lg font-mono text-xs uppercase tracking-wider text-destructive-foreground bg-destructive border border-destructive/20 shadow-card hover:bg-destructive/90 active:translate-y-[1px] active:shadow-pressed transition-all duration-75 cursor-pointer font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background/50 relative z-10 blueprint-grid">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
