import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { slug, contentType, sessionId } = await req.json();
    if (!slug || !contentType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let table = "posts";
    if (contentType === "review") table = "reviews";
    if (contentType === "tool") table = "ai_tools";

    // 1. Fetch current document details to get ID and increment views
    const { data: item, error: selectError } = await supabaseAdmin
      .from(table)
      .select("id, views, view_count")
      .eq("slug", slug)
      .maybeSingle();

    if (selectError) throw selectError;

    if (item) {
      const currentViews = item.view_count !== undefined 
        ? (Number(item.view_count) || 0) 
        : (Number(item.views) || 0);
      
      const updateData = item.view_count !== undefined 
        ? { view_count: currentViews + 1 } 
        : { views: currentViews + 1 };

      await supabaseAdmin
        .from(table)
        .update(updateData)
        .eq("id", item.id);

      // 2. Log pageview event to events table
      await supabaseAdmin
        .from("events")
        .insert({
          type: "pageview",
          tool_id: contentType === "tool" ? item.id : null,
          url: `/${contentType === "post" ? "blog" : "reviews"}/${slug}`,
          source: contentType,
          session_id: sessionId || null
        });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("View tracking error:", error);
    return NextResponse.json({ error: error.message || "Failed to log page view" }, { status: 500 });
  }
}
