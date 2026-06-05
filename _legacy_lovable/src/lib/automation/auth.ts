// Shared bearer-secret auth for automation (n8n, etc.) endpoints.
// All public automation routes must call requireAutomationAuth(request) first.

export function requireAutomationAuth(request: Request): Response | null {
  const expected = process.env.N8N_WEBHOOK_SECRET;
  if (!expected) {
    return json({ error: "N8N_WEBHOOK_SECRET not configured" }, 500);
  }
  const header =
    request.headers.get("x-automation-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  if (!header || header !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
