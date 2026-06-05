// Lovable AI Gateway helper for automation metadata generation.
// Uses LOVABLE_API_KEY which is pre-provisioned in this environment.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-2.5-flash";

export interface GeneratedMetadata {
  title: string;
  slug_hint: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  tags: string[];
  reading_minutes: number;
}

function plainTextFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function generateMetadata(args: {
  title?: string;
  content: unknown;
  hint?: string;
}): Promise<GeneratedMetadata> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const text = plainTextFromContent(args.content).slice(0, 12000);
  const reading = estimateReadingMinutes(text);

  const sys = `You are an SEO editor for an AI tools review site. Given an article, produce JSON with: title (<=70 chars), slug_hint (kebab-case, <=60 chars), excerpt (1-2 sentences, <=200 chars), seo_title (<=60 chars), seo_description (<=158 chars), tags (3-6 short lowercase strings). Respond with ONLY a JSON object, no prose.`;
  const user = `Existing title: ${args.title ?? "(none)"}\nHint: ${args.hint ?? "(none)"}\n\nContent:\n${text}`;

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    throw new Error(`AI gateway error ${res.status}: ${await res.text()}`);
  }
  const payload: any = await res.json();
  const raw = payload?.choices?.[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const title = String(parsed.title || args.title || "Untitled").slice(0, 80);
  return {
    title,
    slug_hint: String(parsed.slug_hint || title).slice(0, 80),
    excerpt: String(parsed.excerpt || "").slice(0, 240),
    seo_title: String(parsed.seo_title || title).slice(0, 70),
    seo_description: String(parsed.seo_description || parsed.excerpt || "").slice(0, 170),
    tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: any) => String(t).toLowerCase()).slice(0, 8) : [],
    reading_minutes: reading,
  };
}
