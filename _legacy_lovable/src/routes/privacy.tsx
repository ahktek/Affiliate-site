import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [{ title: `Privacy — ${SITE_NAME}` }, { name: "description", content: "Privacy policy." }],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <Container size="md" className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
      <div className="prose-content mt-8">
        <p>We collect the minimum data needed to run this site: email when you subscribe, anonymous analytics, and the standard server logs your browser sends.</p>
        <p>We don't sell your data. Subscribers can unsubscribe in one click from any email. Contact us to access or delete your data.</p>
      </div>
    </Container>
  ),
});
