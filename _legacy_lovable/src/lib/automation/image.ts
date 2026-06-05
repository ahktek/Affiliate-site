import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { slugify } from "./slug";

const BUCKET = "post-covers";

/**
 * Download an image from a public URL and store it in the post-covers bucket.
 * Returns the public URL of the stored object.
 */
export async function importImageFromUrl(
  sourceUrl: string,
  opts: { filenameHint?: string } = {},
): Promise<{ url: string; path: string }> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = mimeToExt(contentType);
  const buf = new Uint8Array(await res.arrayBuffer());

  const base = slugify(opts.filenameHint || new URL(sourceUrl).pathname.split("/").pop() || "cover");
  const path = `imports/${Date.now()}-${base}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType, upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

function mimeToExt(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("svg")) return "svg";
  return "jpg";
}
