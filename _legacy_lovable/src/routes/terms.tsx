import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [{ title: `Terms — ${SITE_NAME}` }, { name: "description", content: "Terms of use." }],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <Container size="md" className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Terms of use</h1>
      <div className="prose-content mt-8">
        <p>This site is provided as-is, for informational purposes. We try to be accurate but make no guarantees. Verify pricing and features with the vendor before purchasing.</p>
      </div>
    </Container>
  ),
});
