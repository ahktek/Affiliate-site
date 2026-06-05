export const SITE_NAME = "Stackpilot";
export const SITE_TAGLINE = "Honest reviews of the AI tools worth your money";

export function pageTitle(t?: string) {
  if (!t) return `${SITE_NAME} — ${SITE_TAGLINE}`;
  return `${t} — ${SITE_NAME}`;
}

export function truncate(s: string | null | undefined, n = 158): string {
  if (!s) return "";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n - 1).trimEnd() + "…" : clean;
}
