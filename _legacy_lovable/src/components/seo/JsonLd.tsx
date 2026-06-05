/**
 * Renders a JSON-LD <script> block. Prefer the route `head()` option's
 * `scripts` array for SSR-friendly structured data; use this component only
 * when you need to emit JSON-LD from within client-rendered subtrees.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
