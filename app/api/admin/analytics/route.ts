import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days);

    const prevStartDate = new Date();
    prevStartDate.setDate(now.getDate() - 2 * days);

    const startDateStr = startDate.toISOString();
    const prevStartDateStr = prevStartDate.toISOString();

    // 1. Fetch Events for the requested range (and previous period for comparison)
    const { data: events, error: eventsErr } = await supabaseAdmin
      .from("events")
      .select("*")
      .gte("created_at", prevStartDateStr);

    if (eventsErr) throw eventsErr;

    // 2. Fetch static database counts
    const [
      { count: reviewsCount },
      { count: postsCount },
      { count: toolsCount },
      { count: totalSubscribers },
      { data: reviews },
      { data: posts },
      { data: aiTools }
    ] = await Promise.all([
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("ai_tools").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabaseAdmin.from("subscribers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("reviews").select("id, title, slug, status, created_at, overall_rating, updated_at, categories(name)"),
      supabaseAdmin.from("posts").select("id, title, slug, status, created_at, views, updated_at, categories(name)"),
      supabaseAdmin.from("ai_tools").select("id, name, slug, status, created_at, overall_score, view_count, click_count, updated_at")
    ]);

    // Calculate metrics
    const currentEvents = (events || []).filter(e => new Date(e.created_at) >= startDate);
    const previousEvents = (events || []).filter(e => new Date(e.created_at) < startDate && new Date(e.created_at) >= prevStartDate);

    // Pageviews
    const pvCurrent = currentEvents.filter(e => e.type === "pageview").length;
    const pvPrevious = previousEvents.filter(e => e.type === "pageview").length;
    const pvDiff = pvPrevious > 0 ? ((pvCurrent - pvPrevious) / pvPrevious) * 100 : 0;

    // Affiliate Clicks
    const clickCurrent = currentEvents.filter(e => e.type === "affiliate_click").length;
    const clickPrevious = previousEvents.filter(e => e.type === "affiliate_click").length;
    const clickDiff = clickPrevious > 0 ? ((clickCurrent - clickPrevious) / clickPrevious) * 100 : 0;

    // Subscribers
    const subCurrent = totalSubscribers || 0;
    // Calculate new subscribers in current period
    const subNew = currentEvents.filter(e => e.type === "email_signup").length;
    const subPrevNew = previousEvents.filter(e => e.type === "email_signup").length;
    const subDiff = subPrevNew > 0 ? ((subNew - subPrevNew) / subPrevNew) * 100 : 0;

    // Total content published
    const totalPublished = (reviewsCount || 0) + (postsCount || 0) + (toolsCount || 0);

    // 3. Daily pageviews data for charts
    const dailyViewsMap = new Map<string, { date: string; Views: number; AIToolsViews: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyViewsMap.set(dateKey, { date: dateKey, Views: 0, AIToolsViews: 0 });
    }

    currentEvents.forEach(e => {
      if (e.type === "pageview") {
        const dateKey = new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dailyViewsMap.has(dateKey)) {
          const entry = dailyViewsMap.get(dateKey)!;
          entry.Views += 1;
          if (e.source === "tool") {
            entry.AIToolsViews += 1;
          }
        }
      }
    });

    const dailyViews = Array.from(dailyViewsMap.values()).reverse();

    // 4. Compare Tools counts
    const compareCounts: { [key: string]: number } = {};
    currentEvents.forEach(e => {
      if (e.type === "compare" && e.tool_ids) {
        e.tool_ids.forEach((id: string) => {
          compareCounts[id] = (compareCounts[id] || 0) + 1;
        });
      }
    });

    const compareChartData = Object.entries(compareCounts)
      .map(([id, count]) => {
        const tool = (aiTools || []).find(t => t.id === id);
        return {
          name: tool?.name || "Unknown Tool",
          Comparisons: count
        };
      })
      .sort((a, b) => b.Comparisons - a.Comparisons)
      .slice(0, 8);

    // 5. Affiliate Clicks counts
    const affiliateCounts: { [key: string]: number } = {};
    currentEvents.forEach(e => {
      if (e.type === "affiliate_click" && e.tool_id) {
        affiliateCounts[e.tool_id] = (affiliateCounts[e.tool_id] || 0) + 1;
      }
    });

    const affiliateChartData = Object.entries(affiliateCounts)
      .map(([id, count]) => {
        const tool = (aiTools || []).find(t => t.id === id);
        return {
          id,
          name: tool?.name || "Unknown Tool",
          Clicks: count
        };
      })
      .sort((a, b) => b.Clicks - a.Clicks)
      .slice(0, 10);

    // 6. Top Content Table
    const topContentList: any[] = [];
    
    (reviews || []).forEach(r => {
      const clicks = affiliateCounts[r.id] || 0;
      // Fetch pageviews event count for this specific URL
      const url = `/reviews/${r.slug}`;
      const views = currentEvents.filter(e => e.type === "pageview" && e.url === url).length;

      topContentList.push({
        id: r.id,
        title: r.title,
        type: "Review",
        views: views, // Rely on events table for reviews views
        avgScore: (Number(r.overall_rating) || 0) * 2, // scale out of 10
        clicks,
        lastUpdated: r.updated_at
      });
    });

    (posts || []).forEach(p => {
      const url = `/blog/${p.slug}`;
      const views = currentEvents.filter(e => e.type === "pageview" && e.url === url).length;

      topContentList.push({
        id: p.id,
        title: p.title,
        type: "Article",
        views: views + (p.views || 0),
        avgScore: 0, // No score for articles
        clicks: 0,
        lastUpdated: p.updated_at
      });
    });

    (aiTools || []).forEach(t => {
      const clicks = affiliateCounts[t.id] || 0;
      const url = `/reviews/${t.slug}-review`;
      const views = currentEvents.filter(e => e.type === "pageview" && e.url === url).length;

      topContentList.push({
        id: t.id,
        title: t.name,
        type: "AI Tool",
        views: views + (t.view_count || 0),
        avgScore: Number(t.overall_score) || 0,
        clicks,
        lastUpdated: t.updated_at
      });
    });

    // Sort by views descending
    topContentList.sort((a, b) => b.views - a.views);

    // 7. Status Breakdown
    const statusCounts = { draft: 0, scheduled: 0, published: 0, archived: 0 };
    const allContent = [...(reviews || []), ...(posts || []), ...(aiTools || [])];
    allContent.forEach(item => {
      const status = item.status as keyof typeof statusCounts;
      if (statusCounts[status] !== undefined) {
        statusCounts[status] += 1;
      }
    });

    const statusBreakdown = [
      { name: "Draft", value: statusCounts.draft, color: "#9ca3af" },
      { name: "Scheduled", value: statusCounts.scheduled, color: "#f59e0b" },
      { name: "Published", value: statusCounts.published, color: "#10b981" },
      { name: "Archived", value: statusCounts.archived, color: "#ef4444" }
    ].filter(s => s.value > 0);

    // 8. Subscriber growth chart (grouped by week)
    const subscriberGrowthMap = new Map<string, number>();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    // Sort events by date ascending to calculate cumulative count
    const sortedSubEvents = currentEvents
      .filter(e => e.type === "email_signup")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    let cumulativeCount = Math.max(0, subCurrent - subNew);
    
    // Divide the period into weeks or days
    const intervalDays = days <= 7 ? 1 : 7;
    const groupCount = Math.ceil(days / intervalDays);

    const growthData: { name: string; Subscribers: number }[] = [];
    for (let i = groupCount; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * intervalDays);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Count signups up to this date
      const signupsUpToDate = sortedSubEvents.filter(e => new Date(e.created_at) <= d).length;
      growthData.push({
        name: label,
        Subscribers: cumulativeCount + signupsUpToDate
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        pageViews: { value: pvCurrent, diff: pvDiff },
        reviewsCount: totalPublished,
        affiliateClicks: { value: clickCurrent, diff: clickDiff },
        subscribers: { value: subCurrent, diff: subDiff }
      },
      dailyViews,
      compareChartData,
      affiliateChartData,
      topContentList: topContentList.slice(0, 20),
      statusBreakdown,
      growthData
    });
  } catch (error: any) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to aggregate analytics data" }, { status: 500 });
  }
}
