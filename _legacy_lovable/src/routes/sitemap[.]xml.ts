import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listPostSlugsForSitemap } from "@/lib/posts.functions";
import { listProductSlugsForSitemap } from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };

function urlXml(e: Entry) {
  return [
    "  <url>",
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [{ posts }, { products }, { categories }] = await Promise.all([
          listPostSlugsForSitemap(),
          listProductSlugsForSitemap(),
          listCategories(),
        ]);

        const entries: Entry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/blog", changefreq: "daily", priority: "0.9" },
          { path: "/reviews", changefreq: "daily", priority: "0.9" },
          { path: "/compare", changefreq: "weekly", priority: "0.8" },
          { path: "/tools", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.4" },
          { path: "/contact", changefreq: "monthly", priority: "0.3" },
          { path: "/disclosure", changefreq: "yearly", priority: "0.2" },
        ];

        for (const p of posts) {
          const prefix = p.type === "review" ? "/reviews" : p.type === "comparison" ? "/compare" : "/blog";
          entries.push({
            path: `${prefix}/${p.slug}`,
            lastmod: p.published_at ?? undefined,
            changefreq: "monthly",
            priority: "0.7",
          });
        }
        for (const pr of products) {
          entries.push({
            path: `/tools/${pr.slug}`,
            lastmod: pr.updated_at ?? undefined,
            changefreq: "monthly",
            priority: "0.6",
          });
        }
        for (const c of categories) {
          entries.push({ path: `/categories/${c.slug}`, changefreq: "weekly", priority: "0.5" });
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...entries.map(urlXml),
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
