import { supabase } from "./supabase";

// Get or generate a persistent session ID for the user
const getSessionId = (): string => {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("optura_vibe_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
    localStorage.setItem("optura_vibe_session_id", sessionId);
  }
  return sessionId;
};

/**
 * Tracks a page view event.
 * Hits a backend endpoint to increment view count on the document and log a pageview event.
 */
export async function trackPageView(slug: string, contentType: "post" | "review" | "tool") {
  try {
    const res = await fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, contentType, sessionId: getSessionId() }),
    });
    return res.ok;
  } catch (err) {
    console.error("Analytics: Failed to track page view", err);
    return false;
  }
}

/**
 * Logs a comparison matchup event to the events table.
 */
export async function trackCompareEvent(toolIds: string[]) {
  try {
    const { error } = await supabase.from("events").insert({
      type: "compare",
      tool_ids: toolIds,
      session_id: getSessionId(),
      url: window.location.href,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Analytics: Failed to track compare event", err);
    return false;
  }
}

/**
 * Logs an affiliate link redirect event to the events table.
 */
export async function trackAffiliateClick(toolId: string, url: string) {
  try {
    const { error } = await supabase.from("events").insert({
      type: "affiliate_click",
      tool_id: toolId,
      url,
      session_id: getSessionId(),
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Analytics: Failed to track affiliate click", err);
    return false;
  }
}

/**
 * Logs a newsletter subscription conversion event.
 */
export async function trackEmailSignup(source: string) {
  try {
    const { error } = await supabase.from("events").insert({
      type: "email_signup",
      source,
      session_id: getSessionId(),
      url: window.location.href,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Analytics: Failed to track email signup", err);
    return false;
  }
}
