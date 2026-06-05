import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";

// Use a fallback setup secret or let the first user sign up if no users exist
const SETUP_SECRET = process.env.SETUP_SECRET || "supersecretsetup123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, action, email, password, name } = body;

    // Check if the secret is correct, OR if there are no users in the database, allow the first user to set up.
    const usersSnapshot = await adminDb.collection("users").limit(1).get();
    const isFirstUser = usersSnapshot.empty;

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

      // Create user in Firebase Auth
      let userRecord;
      try {
        userRecord = await adminAuth.createUser({
          email,
          password,
          displayName: name || "Admin User",
        });
      } catch (authError: any) {
        // If user already exists in Auth, try to look them up
        if (authError.code === "auth/email-already-exists") {
          userRecord = await adminAuth.getUserByEmail(email);
        } else {
          throw authError;
        }
      }

      // Create/Update profile in Firestore with 'admin' role
      const userRef = adminDb.collection("users").doc(userRecord.uid);
      await userRef.set({
        id: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || "Admin User",
        role: "admin",
        createdAt: Date.now(),
      }, { merge: true });

      return NextResponse.json({
        success: true,
        message: `Admin user successfully created/updated: ${email}`,
        uid: userRecord.uid,
      });
    }

    if (action === "seedData") {
      // Seed Categories
      const categories = [
        {
          id: "ai-code-assistants",
          name: "AI Code Assistants",
          slug: "ai-code-assistants",
          description: "AI-powered tools designed to help write, debug, and understand code.",
          icon: "Code",
          parentId: null,
          createdAt: Date.now(),
        },
        {
          id: "ai-image-generators",
          name: "AI Image Generators",
          slug: "ai-image-generators",
          description: "Stunning graphics, assets, and photo editors powered by generative AI models.",
          icon: "Image",
          parentId: null,
          createdAt: Date.now(),
        },
        {
          id: "ai-writing-assistants",
          name: "AI Writing Assistants",
          slug: "ai-writing-assistants",
          description: "Copywriting, blogging, SEO, and draft helpers powered by LLMs.",
          icon: "PenTool",
          parentId: null,
          createdAt: Date.now(),
        },
        {
          id: "ai-chatbots",
          name: "AI Chatbots & Agents",
          slug: "ai-chatbots",
          description: "Smart conversational agents for personal and professional productivity.",
          icon: "MessageSquare",
          parentId: null,
          createdAt: Date.now(),
        }
      ];

      for (const cat of categories) {
        await adminDb.collection("categories").doc(cat.id).set(cat, { merge: true });
      }

      // Seed a sample review
      const sampleReview = {
        title: "Cursor AI Review: The Ultimate Next-Gen IDE for AI Pair Programming",
        slug: "cursor-ai-review",
        excerpt: "An in-depth look at Cursor, the forks of VS Code that integrates AI directly into your editor workflow.",
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
        featuredImage: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800",
        category: "ai-code-assistants",
        overallRating: 5,
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
        ctaLinks: [
          { label: "Visit Cursor AI", url: "https://cursor.com" },
          { label: "Get Free Trial", url: "https://cursor.com" }
        ],
        compareWith: [],
        status: "published",
        authorId: "setup-script",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metaTitle: "Cursor AI Review - Is it better than VS Code + Copilot?",
        metaDescription: "We review Cursor AI, the VS Code fork with deep repository indexing. Learn if Composer and Command K are worth the premium subscription.",
      };

      const reviewDocRef = await adminDb.collection("reviews").add(sampleReview);

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
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
        category: "ai-code-assistants",
        tags: ["AI Tools", "Web Development", "Productivity"],
        status: "published",
        authorId: "setup-script",
        views: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metaTitle: "Best AI Developer Tools to Automate Your Workflow (2026)",
        metaDescription: "Boost your productivity with the top 5 AI developer tools in 2026. Reviewing Cursor, v0, Gemini, and more.",
      };

      await adminDb.collection("posts").add(samplePost);

      return NextResponse.json({
        success: true,
        message: "Seed data successfully populated (categories, sample review, sample post).",
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported actions: createAdmin, seedData" }, { status: 400 });
  } catch (error: any) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to set up" }, { status: 500 });
  }
}
