import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Returns a default author id for automation-imported posts (first admin). */
export async function resolveAutomationAuthorId(explicit?: string | null): Promise<string> {
  if (explicit) return explicit;
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.user_id) {
    throw new Error("No admin user exists. Claim admin at /login before importing content.");
  }
  return data.user_id;
}
