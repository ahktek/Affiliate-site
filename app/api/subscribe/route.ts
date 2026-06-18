import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";


export async function POST(req: NextRequest) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const formData = await req.formData();
    const email = (formData.get("email") as string || "").trim();
    const name = (formData.get("name") as string || "").trim();
    const source = (formData.get("source") as string) || "homepage";

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
      return NextResponse.json({ success: true, alreadySubscribed: true });
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
        return NextResponse.json({ success: true, alreadySubscribed: true });
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Subscribe Error:", error);
    // Double-check duplicate error in catch block as safety net
    if (
      error.code === "23505" || 
      error.message?.includes("unique constraint") || 
      error.message?.includes("already exists")
    ) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    return NextResponse.json(
      { error: "Failed to subscribe: " + (error.message || error.details || JSON.stringify(error)) },
      { status: 500 }
    );
  }
}
