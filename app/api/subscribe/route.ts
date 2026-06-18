import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";


export async function POST(req: NextRequest) {
  let isJson = false;
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    
    let email = "";
    let name = "";
    let source = "homepage";

    const contentType = req.headers.get("content-type") || "";
    isJson = contentType.includes("application/json") || req.nextUrl.searchParams.get("json") === "true";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = (body.email || "").trim();
      name = (body.name || "").trim();
      source = body.source || "homepage";
    } else {
      const formData = await req.formData();
      email = (formData.get("email") as string || "").trim();
      name = (formData.get("name") as string || "").trim();
      source = (formData.get("source") as string) || "homepage";
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing, error: selectError } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (selectError) {
      console.error("Select subscriber check error:", selectError);
    }
    
    if (existing) {
      if (isJson) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      // Redirect back with success (even if duplicate, don't leak info or just say success)
      return NextResponse.redirect(new URL("/?subscribed=true", req.url), { status: 303 });
    }

    // Save to Supabase
    const { error } = await supabaseAdmin.from("subscribers").insert({
      email,
      name,
      source,
      timestamp: Date.now(),
      is_verified: false
    });

    if (error) {
      // Handle Postgres unique constraint violation (code 23505) gracefully
      if (error.code === "23505") {
        if (isJson) {
          return NextResponse.json({ success: true, message: "Already subscribed" });
        }
        return NextResponse.redirect(new URL("/?subscribed=true", req.url), { status: 303 });
      }
      throw error;
    }

    // Send Welcome Email (Non-blocking)
    if (resend) {
      try {
        await resend.emails.send({
          from: "AI Reviews <hello@yourdomain.com>",
          to: email,
          subject: "Welcome to AI Reviews!",
          html: `
            <h1>Welcome to AI Reviews!</h1>
            <p>Thanks for subscribing. You'll now receive our latest tool reviews, comparisons, and exclusive deals right in your inbox.</p>
            <br/>
            <p>Best regards,<br/>The AI Reviews Team</p>
          `,
        });
      } catch (emailErr: any) {
        console.error("Welcome email failed to send, but subscription succeeded:", emailErr);
      }
    }

    if (isJson) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.redirect(new URL("/?subscribed=true", req.url), { status: 303 });
  } catch (error: any) {
    console.error("Subscribe Error:", error);
    // Double-check duplicate error in catch block as safety net
    if (
      error.code === "23505" || 
      error.message?.includes("unique constraint") || 
      error.message?.includes("already exists")
    ) {
      if (isJson) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      return NextResponse.redirect(new URL("/?subscribed=true", req.url), { status: 303 });
    }
    return NextResponse.json(
      { error: "Failed to subscribe: " + (error.message || error.details || JSON.stringify(error)) },
      { status: 500 }
    );
  }
}
