import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // 1. Look up the tool by slug using service role client
    const { data: tool, error } = await supabaseAdmin
      .from("ai_tools")
      .select("id, slug, affiliate_url, official_url")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !tool) {
      console.warn(`Redirect failed: Tool with slug '${slug}' not found.`);
      return NextResponse.redirect(new URL("/compare", request.url));
    }

    const destination = tool.affiliate_url || tool.official_url || "/compare";
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";

    // 2. Check Request's User-Agent against bot blocklist
    const botRegex = /googlebot|bingbot|ahrefsbot|semrushbot|mj12bot|dotbot/i;
    const isBot = botRegex.test(userAgent);

    const cookieName = `click_dup_${tool.id}`;
    const hasCookie = request.cookies.has(cookieName);

    // 3. Log analytics click event if not a bot and not deduplicated
    if (!isBot && !hasCookie) {
      const { error: insertError } = await supabaseAdmin
        .from("events")
        .insert({
          tool_id: tool.id,
          tool_slug: tool.slug,
          event_type: "click",
          referrer: referrer || null,
          user_agent: userAgent || null,
        });

      if (insertError) {
        console.error("Failed to log affiliate click event:", insertError.message);
      }
    }

    // 4. Return temporary redirect (302)
    const response = NextResponse.redirect(destination, 302);

    // 5. Set deduplication cookie if event was eligible to log
    if (!isBot && !hasCookie) {
      response.cookies.set(cookieName, "1", {
        maxAge: 60, // 60 seconds
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err) {
    console.error("Error in cloaking redirect route:", err);
    return NextResponse.redirect(new URL("/compare", request.url));
  }
}
