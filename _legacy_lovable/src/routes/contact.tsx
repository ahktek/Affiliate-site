import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE_NAME}` },
      { name: "description", content: `Pitch a review, report an error, or partner with ${SITE_NAME}.` },
      { property: "og:title", content: `Contact — ${SITE_NAME}` },
      { property: "og:description", content: "Get in touch with the editorial team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Container size="md" className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
      <div className="prose-content mt-8">
        <p>The fastest way to reach us:</p>
        <ul>
          <li><strong>Editorial &amp; corrections:</strong> editor@stackpilot.review</li>
          <li><strong>Partnerships &amp; press:</strong> hello@stackpilot.review</li>
        </ul>
        <p>We read everything but reply selectively. Please don't pitch us your AI tool unless you can answer one question: <em>what does it do that the top-3 alternatives don't?</em></p>
      </div>
    </Container>
  );
}
