import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function resolveRedirect(slug: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("redirects")
    .select("id, target_url, click_count, active")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data || !data.active) return null;
  // fire-and-forget increment
  await supabaseAdmin
    .from("redirects")
    .update({ click_count: (data.click_count ?? 0) + 1 })
    .eq("id", data.id);
  return data.target_url;
}
