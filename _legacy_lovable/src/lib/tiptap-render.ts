// Tiptap JSON → HTML renderer with heading IDs (for TOC) and FAQ extraction.
// Supports: doc, paragraph, heading, bulletList, orderedList, listItem, blockquote,
// horizontalRule, hardBreak, image, codeBlock, text + bold/italic/code/link marks.
// Custom node "faq" with attrs.items: [{ question, answer }] for FAQ schema.

type TipNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

export type Heading = { id: string; level: number; text: string };
export type FaqItem = { question: string; answer: string };
export type RenderedContent = {
  html: string;
  headings: Heading[];
  faqs: FaqItem[];
  wordCount: number;
};

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function nodeText(node: TipNode): string {
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(nodeText).join("");
}

function renderMarks(text: string, marks?: TipNode["marks"]): string {
  let out = escape(text);
  if (!marks?.length) return out;
  for (const m of marks) {
    if (m.type === "bold") out = `<strong>${out}</strong>`;
    else if (m.type === "italic") out = `<em>${out}</em>`;
    else if (m.type === "code") out = `<code>${out}</code>`;
    else if (m.type === "link") {
      const href = String(m.attrs?.href ?? "#");
      const isExternal = /^https?:\/\//i.test(href);
      const attrs = isExternal
        ? ` rel="nofollow noopener" target="_blank"`
        : "";
      out = `<a href="${escape(href)}"${attrs}>${out}</a>`;
    }
  }
  return out;
}

function renderNode(
  node: TipNode,
  ctx: { headings: Heading[]; faqs: FaqItem[]; usedIds: Set<string> },
): string {
  switch (node.type) {
    case "doc":
      return (node.content ?? []).map((n) => renderNode(n, ctx)).join("");
    case "paragraph":
      return `<p>${(node.content ?? []).map((n) => renderNode(n, ctx)).join("")}</p>`;
    case "heading": {
      const lvl = Math.min(6, Math.max(1, Number(node.attrs?.level ?? 2)));
      const text = (node.content ?? []).map(nodeText).join("").trim();
      // Demote H1s inside content to H2 — page already has one H1.
      const effectiveLvl = lvl === 1 ? 2 : lvl;
      let id = slugify(text) || `section-${ctx.headings.length + 1}`;
      let unique = id;
      let i = 2;
      while (ctx.usedIds.has(unique)) unique = `${id}-${i++}`;
      ctx.usedIds.add(unique);
      if (effectiveLvl === 2 || effectiveLvl === 3) {
        ctx.headings.push({ id: unique, level: effectiveLvl, text });
      }
      const inner = (node.content ?? []).map((n) => renderNode(n, ctx)).join("");
      return `<h${effectiveLvl} id="${unique}"><a href="#${unique}" class="heading-anchor" aria-label="Link to section">${inner}</a></h${effectiveLvl}>`;
    }
    case "bulletList":
      return `<ul>${(node.content ?? []).map((n) => renderNode(n, ctx)).join("")}</ul>`;
    case "orderedList":
      return `<ol>${(node.content ?? []).map((n) => renderNode(n, ctx)).join("")}</ol>`;
    case "listItem":
      return `<li>${(node.content ?? []).map((n) => renderNode(n, ctx)).join("")}</li>`;
    case "blockquote":
      return `<blockquote>${(node.content ?? []).map((n) => renderNode(n, ctx)).join("")}</blockquote>`;
    case "horizontalRule":
      return `<hr/>`;
    case "hardBreak":
      return `<br/>`;
    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      if (!src) return "";
      return `<figure><img src="${escape(src)}" alt="${escape(alt)}" loading="lazy" /></figure>`;
    }
    case "codeBlock": {
      const inner = (node.content ?? []).map(nodeText).join("");
      return `<pre><code>${escape(inner)}</code></pre>`;
    }
    case "faq": {
      const items = Array.isArray(node.attrs?.items)
        ? (node.attrs!.items as FaqItem[])
        : [];
      for (const it of items) {
        if (it?.question && it?.answer) ctx.faqs.push(it);
      }
      const html = items
        .map(
          (it) =>
            `<details class="faq-item"><summary>${escape(it.question)}</summary><div>${escape(it.answer)}</div></details>`,
        )
        .join("");
      return `<div class="faq-block">${html}</div>`;
    }
    case "text":
      return renderMarks(node.text ?? "", node.marks);
    default:
      return (node.content ?? []).map((n) => renderNode(n, ctx)).join("");
  }
}

export function renderTiptapRich(content: unknown): RenderedContent {
  const empty: RenderedContent = { html: "", headings: [], faqs: [], wordCount: 0 };
  if (!content) return empty;
  const ctx = { headings: [] as Heading[], faqs: [] as FaqItem[], usedIds: new Set<string>() };
  let html = "";
  try {
    if (typeof content === "string") {
      html = content;
    } else {
      html = renderNode(content as TipNode, ctx);
    }
  } catch {
    return empty;
  }
  const wordCount = html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return { html, headings: ctx.headings, faqs: ctx.faqs, wordCount };
}

// Back-compat
export function renderTiptap(content: unknown): string {
  return renderTiptapRich(content).html;
}
