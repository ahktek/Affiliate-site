import { SITE_NAME } from "./seo";

/** Schema.org JSON-LD builders. Pass results to route `head().scripts`. */

export function organizationSchema(siteUrl = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
  };
}

export function articleSchema(opts: {
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  authorName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description ?? undefined,
    url: opts.url,
    image: opts.image ?? undefined,
    datePublished: opts.datePublished ?? undefined,
    dateModified: opts.dateModified ?? undefined,
    author: opts.authorName ? { "@type": "Person", name: opts.authorName } : undefined,
  };
}

export function productReviewSchema(opts: {
  productName: string;
  description?: string | null;
  image?: string | null;
  rating?: number | null;
  reviewBody?: string | null;
  authorName?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.productName,
    description: opts.description ?? undefined,
    image: opts.image ?? undefined,
    review: opts.reviewBody
      ? {
          "@type": "Review",
          reviewBody: opts.reviewBody,
          author: opts.authorName ? { "@type": "Person", name: opts.authorName } : undefined,
          reviewRating:
            typeof opts.rating === "number"
              ? { "@type": "Rating", ratingValue: opts.rating, bestRating: 5 }
              : undefined,
        }
      : undefined,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}
