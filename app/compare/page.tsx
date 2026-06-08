import { supabase } from "@/lib/supabase";
import CompareClient from "./CompareClient";

export const metadata = {
  title: "Compare AI Tools | Head-to-Head Spec Matchup Engine",
  description: "Compare artificial intelligence tools side-by-side. Analyze performance ratings, starting prices, API access, integrations, context windows, and limitations.",
};

export default async function ComparePage() {
  const { data: tools } = await supabase
    .from("ai_tools")
    .select("*")
    .eq("status", "published")
    .order("overall_score", { ascending: false });

  return <CompareClient initialTools={tools || []} />;
}
