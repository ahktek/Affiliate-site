import { Link } from "@tanstack/react-router";
import { Container } from "./Container";
import { SITE_NAME } from "@/lib/seo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface-muted">
      <Container size="xl">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="size-5 rounded bg-gradient-to-br from-primary to-[oklch(0.62_0.22_320)]" />
              {SITE_NAME}
            </div>
            <p className="mt-3 text-muted-foreground">
              Independent, hands-on reviews of the AI tools and SaaS people actually use.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/reviews" className="hover:text-foreground text-muted-foreground">Reviews</Link></li>
              <li><Link to="/compare" className="hover:text-foreground text-muted-foreground">Comparisons</Link></li>
              <li><Link to="/tools" className="hover:text-foreground text-muted-foreground">Tools directory</Link></li>
              <li><Link to="/blog" className="hover:text-foreground text-muted-foreground">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/about" className="hover:text-foreground text-muted-foreground">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground text-muted-foreground">Contact</Link></li>
              <li><Link to="/disclosure" className="hover:text-foreground text-muted-foreground">Affiliate disclosure</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/privacy" className="hover:text-foreground text-muted-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground text-muted-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="py-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All product names belong to their respective owners.</p>
          <p>Some links are affiliate links — we may earn a commission at no extra cost to you.</p>
        </div>
      </Container>
    </footer>
  );
}
