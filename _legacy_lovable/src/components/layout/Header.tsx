import { Link } from "@tanstack/react-router";
import { Container } from "./Container";
import { SITE_NAME } from "@/lib/seo";

const nav = [
  { to: "/reviews", label: "Reviews" },
  { to: "/compare", label: "Compare" },
  { to: "/tools", label: "Tools" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span
              aria-hidden
              className="inline-block size-6 rounded-md bg-gradient-to-br from-primary to-[oklch(0.62_0.22_320)] shadow-[var(--shadow-glow)]"
            />
            <span>{SITE_NAME}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/reviews"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 h-9 hover:opacity-90 transition shadow-[var(--shadow-card)]"
            >
              Browse reviews
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
