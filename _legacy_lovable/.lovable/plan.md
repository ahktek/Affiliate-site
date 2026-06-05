
# AI Tools Affiliate Review Platform — Implementation Plan

Stack confirmed: **TanStack Start (SSR) + Lovable Cloud (Supabase) + Tailwind + shadcn/ui**, deployed on Cloudflare Workers. Roles: admin / editor / author. Editor: Tiptap. Newsletter: subscribers table only.

## 1. Database (Lovable Cloud)

Enums:
- `app_role`: admin | editor | author
- `post_status`: draft | scheduled | published
- `post_type`: article | review | comparison | guide

Tables (all RLS-enabled):
- **profiles** — `id (uuid, FK auth.users)`, display_name, avatar_url, bio, twitter, website
- **user_roles** — `(user_id, role)` unique; SECURITY DEFINER `has_role(uid, role)` (see user-roles pattern; never store roles on profiles)
- **categories** — id, slug (unique), name, description, icon, sort_order, seo_title, seo_description
- **products** — id, slug, name, vendor, logo_url, website_url, affiliate_url, short_description, long_description (jsonb tiptap), pricing_model, starting_price, currency, rating (numeric 0–5), pros (text[]), cons (text[]), best_for, primary_category_id, featured, created_at, updated_at
- **product_categories** — many-to-many (product_id, category_id)
- **posts** — id, slug, type (post_type), title, excerpt, content (jsonb tiptap), cover_image_url, author_id, primary_category_id, status, scheduled_at, published_at, reading_minutes, seo_title, seo_description, og_image_url, canonical_url, featured, view_count
- **post_categories** — m2m
- **post_products** — m2m (review/comparison ↔ products), with `position` for comparison ordering
- **comparison_criteria** — id, comparison_post_id (FK posts), label, sort_order
- **comparison_scores** — comparison_post_id, product_id, criterion_id, score, note
- **subscribers** — id, email (unique, citext), source, status (active/unsubscribed), confirmed_at, ip, user_agent, created_at
- **redirects** — id, slug (unique), target_url, product_id (nullable), click_count — powers `/go/:slug` cloaked affiliate links

RLS summary:
- Public SELECT on published posts, all products/categories, joins for those.
- `subscribers` INSERT open to anon (rate-limited at app layer); SELECT admin/editor only.
- All write tables: `has_role(auth.uid(), 'admin' | 'editor' | 'author')` with author scope `author_id = auth.uid()` for `author`.

## 2. Routing (TanStack Start, file-based)

Public:
```
/                          home (featured reviews, categories, latest posts, newsletter)
/blog                      paginated list
/blog/$slug                article
/reviews                   list
/reviews/$slug             product review (rich, sticky CTA)
/compare                   browse comparisons
/compare/$slug             comparison page
/tools                     product directory
/tools/$slug               product profile
/categories/$slug          category landing
/about, /contact, /privacy, /terms, /disclosure
/go/$slug                  affiliate redirect (server route: 302 + click log)
/sitemap.xml               server route — dynamic from posts/products/categories
/robots.txt                static
```

Authenticated:
```
/login                                            (email + password)
/_authenticated/                                  layout gate
  account                                         profile edit
  admin/                                          requires admin|editor
    index                                         dashboard (KPIs)
    posts, posts/new, posts/$id
    products, products/new, products/$id
    categories
    comparisons
    subscribers
    redirects
    media
    users                                         admin-only
```

## 3. Server functions & routes

`src/lib/*.functions.ts` (callable from loaders/components):
- `posts.functions.ts`: listPublished, getBySlug, listByCategory, adminListPosts, savePost, publishPost, deletePost
- `products.functions.ts`: list, getBySlug, adminCRUD
- `categories.functions.ts`: list, adminCRUD
- `comparisons.functions.ts`: getBySlug (joins posts+products+criteria+scores)
- `subscribers.functions.ts`: subscribe (zod validated), adminList, exportCsv
- `media.functions.ts`: signed upload URL via Supabase Storage
- `dashboard.functions.ts`: KPI aggregates

Server routes (`src/routes/api/...`):
- `/go/$slug` — increment click_count via supabaseAdmin, then 302 to affiliate_url
- `/sitemap[.]xml` — generate from DB
- `/api/public/og/$type/$slug` — optional dynamic OG image (phase 2)

All authed mutations use `requireSupabaseAuth` + `has_role` check in handler.

## 4. Folder architecture

```
src/
  routes/                  TanStack file routes (above)
  components/
    layout/                Header (glass nav), Footer, Container
    home/                  Hero, FeaturedReviews, CategoryGrid, LatestPosts
    blog/                  PostCard, PostMeta, TableOfContents, ShareBar
    review/                RatingBadge, ProsCons, ScoreBar, StickyCTA, PricingTable
    compare/               ComparisonTable, ScoreCell, ProductColumn
    product/               ProductCard, ProductHero, AffiliateButton
    newsletter/            InlineForm, ModalForm, FooterForm
    admin/                 DataTable, StatusBadge, SidebarNav, KpiCard
    editor/                TiptapEditor, Toolbar, ImageNode, ProductEmbedNode, CalloutNode
    seo/                   JsonLd helpers (Article, Product, FAQ, BreadcrumbList)
    ui/                    shadcn primitives
  lib/
    *.functions.ts         server fns
    *.server.ts            server-only helpers
    schemas.ts             zod (shared)
    seo.ts                 meta builders
    slug.ts, reading-time.ts, formatters.ts
  integrations/supabase/   generated (client, client.server, auth-middleware, auth-attacher)
  hooks/                   useAuth, useRole, useDebounce
  styles.css               tokens
```

## 5. Design system

- Inter (variable) loaded via `<link>` in `__root.tsx`.
- Tokens in `styles.css` (oklch): neutral base (near-white + ink), restrained accent (electric indigo), success/warning/danger, subtle gradient `--gradient-surface`, soft shadow `--shadow-card`, `--shadow-glow`.
- Components: glass navbar (backdrop-blur + border), rounded-2xl cards, generous spacing scale, max-w-prose for article body, sidebar (TOC + sticky CTA) on `lg+` only.
- Motion: tasteful fade/translate on scroll for hero & cards (framer-motion).
- Dark mode supported via `.dark` tokens.

## 6. SEO

- Per-route `head()` with title/description/og/canonical (leaf only).
- JSON-LD: Organization+WebSite in `__root`; Article on posts; Product+Review (with aggregateRating) on review pages; ItemList on comparisons; BreadcrumbList on deep routes; FAQPage where applicable.
- Dynamic `/sitemap.xml` server route pulling published rows.
- `robots.txt` allow-all + sitemap reference once domain set.
- og:image: use post.cover_image_url / product.logo_url on leaves only.

## 7. Performance

- TanStack Query in loaders (`ensureQueryData`) + `useSuspenseQuery` in components.
- Route-level code splitting is automatic; admin bundle isolated under `_authenticated/admin`.
- Images: WebP via Supabase Storage transformations, `loading="lazy"`, explicit aspect-ratio wrappers, `srcset`.
- Tiptap loaded only in admin route chunks.
- Avoid client `useEffect+fetch`; rely on SSR for public pages → instant LCP & crawlable HTML.

## 8. Security

- `user_roles` table + `has_role()` SECURITY DEFINER (never roles on profiles).
- RLS policies on every table; admin writes via authed server fns calling `has_role`.
- Zod validation on every server fn input; sanitize Tiptap HTML on render with DOMPurify on output.
- Affiliate redirects via cloaked `/go/$slug` (allowlisted in DB, never user-supplied URLs).
- Newsletter form: zod email + honeypot + simple rate-limit table.
- No service-role key in client; `client.server.ts` only inside server fns.

## 9. Implementation roadmap (phased, shippable per phase)

**Phase 1 — Foundation**
1. Enable Lovable Cloud.
2. Migrations: enums, profiles, user_roles, has_role(), categories, products, posts (+ m2m), subscribers, redirects, comparison tables, RLS policies, triggers (updated_at, profile auto-create, slug uniqueness, view_count rpc).
3. Design tokens + shadcn theme + Inter + glass navbar + footer + container primitives.

**Phase 2 — Public site (read-only)**
4. Home, blog list/detail, product/review detail, comparison detail, category, tools directory.
5. Newsletter forms + subscribe server fn.
6. `/go/$slug` redirect + click tracking.
7. SEO: head() per route, JSON-LD components, sitemap.xml route, robots.txt.

**Phase 3 — Auth & admin shell**
8. /login (email+password), `_authenticated` gate, role-aware admin layout, dashboard KPIs.
9. Tiptap editor (with image upload, product-embed, callout, table, code, link nodes).

**Phase 4 — Admin CRUD**
10. Posts CRUD (draft/schedule/publish, cover image upload).
11. Products CRUD (logo upload, affiliate URL, pros/cons editor).
12. Categories CRUD.
13. Comparison builder (pick products + criteria + scores).
14. Subscribers list + CSV export.
15. Redirects manager.

**Phase 5 — Polish & future hooks**
16. Search (Postgres full-text on posts/products).
17. Related content, breadcrumb component, TOC.
18. Lighthouse pass, a11y pass (WCAG 2.1 AA), Core Web Vitals.
19. Stubs for future AI: server fn placeholders for `generateSummary`, `suggestPros Cons`, `draftPostFromUrl` (using Lovable AI Gateway later).

## 10. Open items (defer unless you say otherwise)

- Realistic seed content: I'll seed ~6 categories, ~12 real AI tools (ChatGPT, Claude, Midjourney, Perplexity, Notion AI, Jasper, Copy.ai, Runway, ElevenLabs, Cursor, GitHub Copilot, Zapier AI) with accurate metadata, and 3–4 example reviews/comparisons. Confirm if you want different products.
- Affiliate IDs are placeholders until you provide them — stored in `products.affiliate_url`.
- Dynamic OG image generation deferred to Phase 5.
- AI Gateway integration deferred (scaffolded only).

If this looks right, approve and I'll start with Phase 1.
