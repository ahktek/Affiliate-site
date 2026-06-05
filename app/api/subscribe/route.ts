import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { adminDb } from "@/lib/firebase/admin";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const source = formData.get("source") as string || "homepage";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email already exists
    const existing = await adminDb.collection("subscribers").where("email", "==", email).get();
    
    if (!existing.empty) {
      // Redirect back with success (even if duplicate, don't leak info or just say success)
      return NextResponse.redirect(new URL("/?subscribed=true", req.url));
    }

    // Save to Firestore
    await adminDb.collection("subscribers").add({
      email,
      name: "", // Can capture name later if needed
      source,
      timestamp: Date.now(),
      isVerified: false
    });

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
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
    }

    return NextResponse.redirect(new URL("/?subscribed=true", req.url));
  } catch (error: any) {
    console.error("Subscribe Error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
