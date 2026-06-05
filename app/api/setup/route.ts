import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SETUP_SECRET = process.env.SETUP_SECRET || "supersecretsetup123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, action, email, password, name } = body;

    // Check if profiles are empty to allow public first setup
    const { count, error: countError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const isFirstUser = count === 0;

    if (secret !== SETUP_SECRET && !isFirstUser) {
      return NextResponse.json(
        { error: "Unauthorized. Setup secret is incorrect and database is not empty." },
        { status: 401 }
      );
    }

    if (action === "createAdmin") {
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }

      // Create user using Supabase Admin Auth API (bypasses email verification)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: name || "Admin User" },
      });

      if (authError) {
        // If user already exists, let's promote them to admin
        if (authError.message.includes("already registered")) {
          // Look up user by email
          const { data: usersData, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = usersData?.users.find((u) => u.email === email);
          if (existingUser) {
            const { error: roleError } = await supabaseAdmin
              .from("profiles")
              .update({ role: "admin" })
              .eq("id", existingUser.id);

            if (roleError) throw roleError;

            return NextResponse.json({
              success: true,
              message: `Promoted existing user: ${email} to admin.`,
            });
          }
        }
        throw authError;
      }

      // Explicitly update the profile role to 'admin' (the trigger sets it, but let's be 100% sure)
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Profile role update error:", profileError);
      }

      return NextResponse.json({
        success: true,
        message: `Admin user successfully created & confirmed: ${email}`,
        uid: authData.user.id,
      });
    }

    if (action === "seedData") {
      // Seed Categories
      const categories = [
        {
          id: "10000000-0000-0000-0000-000000000001",
          name: "AI Code Assistants",
          slug: "ai-code-assistants",
          description: "AI-powered tools designed to help write, debug, and understand code.",
          icon: "Code",
        },
        {
          id: "20000000-0000-0000-0000-000000000002",
          name: "AI Image Generators",
          slug: "ai-image-generators",
          description: "Stunning graphics, assets, and photo editors powered by generative AI models.",
          icon: "Image",
        },
        {
          id: "30000000-0000-0000-0000-000000000003",
          name: "AI Writing Assistants",
          slug: "ai-writing-assistants",
          description: "Copywriting, blogging, SEO, and draft helpers powered by LLMs.",
          icon: "PenTool",
        },
        {
          id: "40000000-0000-0000-0000-000000000004",
          name: "AI Chatbots & Agents",
          slug: "ai-chatbots",
          description: "Smart conversational agents for personal and professional productivity.",
          icon: "MessageSquare",
        }
      ];

      for (const cat of categories) {
        const { error } = await supabaseAdmin.from("categories").upsert(cat, { onConflict: "slug" });
        if (error) throw error;
      }

      // Seed a sample review
      const sampleReview = {
        title: "Cursor AI",
        slug: "cursor-ai-review",
        excerpt: "An in-depth look at Cursor, the fork of VS Code that integrates AI directly into your editor workflow.",
        content: `
          <h2>Why Cursor is changing the developer workflow</h2>
          <p>Cursor is an editor built on top of Visual Studio Code that integrates language models like GPT-4o and Claude 3.5 Sonnet directly into the editing experience. Unlike standard extensions, Cursor has access to your entire codebase, indexing it locally to answer repository-wide questions.</p>
          <h3>Key Features</h3>
          <ul>
            <li><strong>Command K (Inline Edit):</strong> Describe changes directly in your editor and watch them generate in real-time.</li>
            <li><strong>Composer (Multi-file edit):</strong> Edit multiple files simultaneously with AI supervision.</li>
            <li><strong>Chat (Ctrl/Cmd L):</strong> Chat with the model about your selected code or full repository.</li>
          </ul>
        `,
        featured_image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800",
        category_id: "10000000-0000-0000-0000-000000000001",
        overall_rating: 4.8,
        scores: {
          performance: 9.8,
          value: 9.0,
          design: 9.5,
          easeOfUse: 9.7,
        },
        pros: [
          "Seamless integration built directly on VS Code",
          "Deep codebase index context matching",
          "Composer mode edits multiple files simultaneously",
          "Includes free/premium tiers with Claude & GPT-4"
        ],
        cons: [
          "Sub-based plan can get expensive for heavy users",
          "High energy usage during indexing"
        ],
        cta_links: [
          { label: "Visit Cursor AI", url: "https://cursor.com" },
          { label: "Get Free Trial", url: "https://cursor.com" }
        ],
        compare_with: [],
        status: "published",
        meta_title: "Cursor AI Review - Is it better than VS Code + Copilot?",
        meta_description: "We review Cursor AI, the VS Code fork with deep repository indexing. Learn if Composer and Command K are worth the premium subscription.",
      };

      const { error: reviewError } = await supabaseAdmin.from("reviews").upsert(sampleReview, { onConflict: "slug" });
      if (reviewError) throw reviewError;

      // Seed a sample post
      const samplePost = {
        title: "Top 5 AI Tools to Automate Your Dev Workflow in 2026",
        slug: "top-5-ai-dev-tools-2026",
        excerpt: "Discover the best artificial intelligence tools for developers, from code assistants to design and debugging software.",
        content: `
          <p>The developer landscape is shifting rapidly. AI tools are no longer simple autocompletes; they are becoming agentic partners that can build entire feature pipelines. Here are the top 5 tools you should adopt in 2026:</p>
          <ol>
            <li><strong>Cursor AI:</strong> The best overall code editor with deep AI integration.</li>
            <li><strong>v0 by Vercel:</strong> Create modern React/Tailwind UI elements instantly with prompts.</li>
            <li><strong>Gemini 1.5 Flash:</strong> Extremely fast API for long-context code understanding.</li>
            <li><strong>Linear:</strong> Beautiful issue tracking that now automates updates using AI.</li>
            <li><strong>GitHub Copilot Workspace:</strong> Plan and execute pull requests fully inside natural language.</li>
          </ol>
        `,
        featured_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        category_id: "10000000-0000-0000-0000-000000000001",
        tags: ["AI Tools", "Web Development", "Productivity"],
        status: "published",
        views: 154,
        meta_title: "Best AI Developer Tools to Automate Your Workflow (2026)",
        meta_description: "Boost your productivity with the top 5 AI developer tools in 2026. Reviewing Cursor, v0, Gemini, and more.",
      };

      const { error: postError } = await supabaseAdmin.from("posts").upsert(samplePost, { onConflict: "slug" });
      if (postError) throw postError;

      return NextResponse.json({
        success: true,
        message: "Seed data successfully populated (categories, sample review, sample post) in Supabase.",
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported actions: createAdmin, seedData" }, { status: 400 });
  } catch (error: any) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to set up" }, { status: 500 });
  }
}
