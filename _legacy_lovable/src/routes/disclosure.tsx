import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/disclosure")({
  head: () => ({
    meta: [
      { title: `Affiliate disclosure — ${SITE_NAME}` },
      { name: "description", content: `How ${SITE_NAME} makes money and how that affects what we publish.` },
      { property: "og:url", content: "/disclosure" },
    ],
    links: [{ rel: "canonical", href: "/disclosure" }],
  }),
  component: () => (
    <Container size="md" className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Affiliate disclosure</h1>
      <div className="prose-content mt-8">
        <p>
          {SITE_NAME} participates in affiliate programs with some of the products we review. When you click a link
          marked as sponsored or affiliate and complete a purchase, we may earn a commission. You pay the same price.
        </p>
        <p>
          We do <strong>not</strong> accept payment in exchange for positive reviews, higher rankings, or featured
          placement. Our scores are determined by our testing methodology, not commercial relationships. We disclose
          affiliate links inline and in the footer of every page.
        </p>
      </div>
    </Container>
  ),
});
