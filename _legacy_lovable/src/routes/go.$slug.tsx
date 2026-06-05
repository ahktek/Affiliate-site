import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveRedirect } from "@/lib/redirects.functions";

export const Route = createFileRoute("/go/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const target = await resolveRedirect(params.slug);
        if (!target) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(null, { status: 302, headers: { Location: target } });
      },
    },
  },
  beforeLoad: async ({ params }) => {
    const target = await resolveRedirect(params.slug);
    if (target) throw redirect({ href: target });
    throw redirect({ to: "/" });
  },
  component: () => null,
});
