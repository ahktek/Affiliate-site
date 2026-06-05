import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Package,
  FolderTree,
  Mail,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Item = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const items: Item[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/posts", label: "Posts", icon: FileText },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email?: string | null }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r bg-card">
      <div className="h-14 flex items-center px-5 border-b">
        <Link to="/admin" className="font-semibold tracking-tight">Stackpilot Admin</Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const active = item.exact ? path === item.to : path.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to as any}
              className={
                "flex items-center gap-3 rounded-md px-3 h-9 text-sm transition-colors " +
                (active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted")
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 text-xs">
        <div className="px-2 py-1.5 truncate text-muted-foreground" title={email ?? ""}>
          {email ?? "Signed in"}
        </div>
        <button
          onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/login"))}
          className="mt-1 w-full flex items-center gap-2 rounded-md px-2 h-9 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminMobileBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="md:hidden flex overflow-x-auto gap-1 border-b bg-card px-3 py-2">
      {items.map((item) => {
        const active = item.exact ? path === item.to : path.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to as any}
            className={
              "shrink-0 rounded-md px-3 h-8 inline-flex items-center text-xs " +
              (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-muted")
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
