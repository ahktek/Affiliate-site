import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Authorization check: secret token or auth header
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const authHeader = req.headers.get("Authorization");

    const expectedSecret = process.env.SETUP_SECRET || "supersecretsetup123";

    const isSecretValid = secret === expectedSecret;
    const isAuthHeaderValid = authHeader === `Bearer ${expectedSecret}`;

    if (!isSecretValid && !isAuthHeaderValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const nowStr = new Date().toISOString();
    const publishedItems: { type: string; id: string; title: string }[] = [];

    // 2. Query and publish scheduled Posts
    const { data: postsToPublish, error: postsError } = await supabaseAdmin
      .from("posts")
      .select("id, title")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowStr);

    if (postsError) throw postsError;

    if (postsToPublish && postsToPublish.length > 0) {
      const ids = postsToPublish.map(p => p.id);
      const { error: updateError } = await supabaseAdmin
        .from("posts")
        .update({ status: "published", published_at: nowStr })
        .in("id", ids);

      if (updateError) throw updateError;
      
      postsToPublish.forEach(p => {
        publishedItems.push({ type: "post", id: p.id, title: p.title });
      });
    }

    // 3. Query and publish scheduled Reviews
    const { data: reviewsToPublish, error: reviewsError } = await supabaseAdmin
      .from("reviews")
      .select("id, title")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowStr);

    if (reviewsError) throw reviewsError;

    if (reviewsToPublish && reviewsToPublish.length > 0) {
      const ids = reviewsToPublish.map(r => r.id);
      const { error: updateError } = await supabaseAdmin
        .from("reviews")
        .update({ status: "published", published_at: nowStr })
        .in("id", ids);

      if (updateError) throw updateError;

      reviewsToPublish.forEach(r => {
        publishedItems.push({ type: "review", id: r.id, title: r.title });
      });
    }

    // 4. Query and publish scheduled AI Tools
    const { data: toolsToPublish, error: toolsError } = await supabaseAdmin
      .from("ai_tools")
      .select("id, name")
      .eq("status", "scheduled")
      .lte("scheduled_at", nowStr);

    if (toolsError) throw toolsError;

    if (toolsToPublish && toolsToPublish.length > 0) {
      const ids = toolsToPublish.map(t => t.id);
      const { error: updateError } = await supabaseAdmin
        .from("ai_tools")
        .update({ status: "published", published_at: nowStr })
        .in("id", ids);

      if (updateError) throw updateError;

      toolsToPublish.forEach(t => {
        publishedItems.push({ type: "ai_tool", id: t.id, title: t.name });
      });
    }

    // 5. Log actions in database
    if (publishedItems.length > 0) {
      try {
        await supabaseAdmin
          .from("admin_logs")
          .insert({
            action: "auto_publish",
            details: {
              publishedCount: publishedItems.length,
              items: publishedItems,
              timestamp: nowStr
            }
          });
      } catch (logErr) {
        console.warn("Failed to write to admin_logs table", logErr);
      }
      console.log(`Auto-publish cron: Published ${publishedItems.length} items.`, publishedItems);
    }

    return NextResponse.json({
      success: true,
      publishedCount: publishedItems.length,
      items: publishedItems
    });
  } catch (error: any) {
    console.error("Auto-Publish Cron Error:", error);
    return NextResponse.json({ error: error.message || "Cron job failed" }, { status: 500 });
  }
}
export const POST = GET; // Accept both GET and POST
