import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/layout/Container";
import { SITE_NAME } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${SITE_NAME}` },
      { name: "description", content: `${SITE_NAME} is an independent review site for AI tools and SaaS, built by practitioners.` },
      { property: "og:title", content: `About — ${SITE_NAME}` },
      { property: "og:description", content: "Who we are, how we test, and how we pay the bills." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Container size="md" className="py-20">
      <h1 className="text-4xl font-semibold tracking-tight">About {SITE_NAME}</h1>
      <div className="prose-content mt-8">
        <p>
          {SITE_NAME} is an independent publication that reviews the AI tools and SaaS products people actually use at
          work. Everything we publish starts with a real workflow — a writer drafting an article, an engineer shipping a
          feature, a designer mocking a screen — and we measure the tool against that.
        </p>
        <h2>How we test</h2>
        <p>
          We pay for the tools we review out of pocket whenever possible. Reviewers spend at least a week with each
          product, run a structured workflow checklist, and document what worked and what didn't. We re-test products
          when major versions ship.
        </p>
        <h2>How we make money</h2>
        <p>
          Some of the outbound links on this site are affiliate links — we earn a small commission if you buy through
          them, at no extra cost to you. Affiliate status never influences our scores or rankings, and we don't take
          payment to feature a tool. See our <a href="/disclosure">affiliate disclosure</a> for the full policy.
        </p>
      </div>
    </Container>
  );
}
