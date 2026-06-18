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

      // Explicitly update the profile role to 'admin'
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
      // 1. Seed Categories
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

      // 2. Seed Rich Editorial Product Reviews
      const reviews = [
        {
          title: "Cursor AI",
          slug: "cursor-ai",
          excerpt: "An in-depth look at Cursor, the fork of VS Code that integrates AI directly into your editor workflow.",
          content: `
            <h2>Why Cursor is changing the developer workflow</h2>
            <p>Cursor is an editor built on top of Visual Studio Code that integrates language models like GPT-4o and Claude 3.5 Sonnet directly into the editing experience. Unlike standard extensions, Cursor has access to your entire codebase, indexing it locally to answer repository-wide questions.</p>
            <blockquote>"Cursor makes coding feel like writing code in collaboration with an assistant who remembers every API you ever defined."</blockquote>
            <h3>Key Features & Composer</h3>
            <p>The standout feature is Composer. Activated with Ctrl+I, it lets you ask the AI to perform complex edits across multiple files simultaneously. It handles boilerplate, imports, and refactors without copy-pasting.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800",
          category_id: "10000000-0000-0000-0000-000000000001",
          overall_rating: 4.6,
          scores: { performance: 9.5, value: 9.0, design: 9.5, easeOfUse: 9.0 },
          pros: [
            "Composer mode edits multiple files simultaneously",
            "Instant codebase index for deep workspace context",
            "Familiar VS Code keybinds and settings sync",
            "Fast tab-completion updates code in place"
          ],
          cons: [
            "Subscription is costly for power users",
            "High memory consumption on large workspaces"
          ],
          cta_links: [{ label: "Try Cursor AI", url: "https://cursor.com" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "Claude 3.5 Sonnet",
          slug: "claude-sonnet",
          excerpt: "Anthropic's latest model raises the bar for reasoning, coding assistance, and natural writing tone.",
          content: `
            <h2>A Leap Forward in Cognitive Performance</h2>
            <p>Claude 3.5 Sonnet is Anthropic's mid-tier model that outperforms previous flagship models in logic, mathematics, and software design. Its primary differentiator is its tone: it writes in a nuanced, natural voice that avoids the overly formal or robotic templates common in other LLMs.</p>
            <blockquote>"Anthropic has built a model that reasoning-wise feels like a colleague rather than a dictionary search bar."</blockquote>
            <h3>Coding and Reasoning Capabilities</h3>
            <p>For programmers, Claude 3.5 Sonnet handles logical edge cases, database schemas, and algorithm generation with high accuracy, producing clean, structured syntax on first attempt.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
          category_id: "40000000-0000-0000-0000-000000000004",
          overall_rating: 4.7,
          scores: { performance: 9.8, value: 9.2, design: 9.0, easeOfUse: 9.5 },
          pros: [
            "State-of-the-art coding and math reasoning",
            "Exceptionally natural, editorial writing tone",
            "Quick processing speed and large token window",
            "Superb image transcription and visual analysis"
          ],
          cons: [
            "Strict rate limits on the free plan",
            "No web-search tool in native interface"
          ],
          cta_links: [{ label: "Access Claude", url: "https://claude.ai" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "Midjourney v6",
          slug: "midjourney-v6",
          excerpt: "We review the newest Midjourney release, testing its photorealism, text rendering, and prompt accuracy.",
          content: `
            <h2>Next-Generation Generative Photography</h2>
            <p>Midjourney v6 marks a significant milestone in generative image creation. This version introduces two critical improvements: the ability to render legible English text inside images, and a vastly improved understanding of descriptive, conversational prompts.</p>
            <h3>Photorealism and Fine Details</h3>
            <p>Portraits look organic, matching real camera lenses and skin textures rather than the plastic, hyper-smoothed vectors typical of earlier neural network drafts.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
          category_id: "20000000-0000-0000-0000-000000000002",
          overall_rating: 4.5,
          scores: { performance: 9.6, value: 8.5, design: 9.0, easeOfUse: 7.5 },
          pros: [
            "Stunning photorealistic details and camera matching",
            "Reliable text generation inside images",
            "Nuanced understanding of short, descriptive prompts",
            "Expanded web editor interface for subscribers"
          ],
          cons: [
            "Discord interface remains clumsy for beginners",
            "Subscription plans do not offer unlimited fast hours"
          ],
          cta_links: [{ label: "Visit Midjourney", url: "https://midjourney.com" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "Jasper AI",
          slug: "jasper-ai",
          excerpt: "An in-depth review of the enterprise copywriting platform designed to scale marketing content.",
          content: `
            <h2>Enterprise Brand Alignment</h2>
            <p>Jasper AI focuses on scaling content marketing teams. Unlike raw models, Jasper allows corporations to build custom 'Brand Voices' by indexing marketing assets, ensuring copy remains cohesive across all active campaigns.</p>
            <h3>Templates and Workflows</h3>
            <p>It includes built-in templates for blog posts, email lists, and social media captions, helping editors establish high-volume content flows in minutes.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
          category_id: "30000000-0000-0000-0000-000000000003",
          overall_rating: 4.1,
          scores: { performance: 8.0, value: 7.5, design: 8.5, easeOfUse: 8.5 },
          pros: [
            "Excellent brand voice modeling and campaign assets",
            "Stunning dashboard layout for team collaboration",
            "Built-in SEO integration via Surfer SEO",
            "Over 50+ templates for social media and marketing copy"
          ],
          cons: [
            "Expensive pricing structure for solo creators",
            "Outputs still require significant editorial editing"
          ],
          cta_links: [{ label: "Try Jasper AI", url: "https://jasper.ai" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "ChatGPT Plus",
          slug: "chatgpt-plus",
          excerpt: "Does the $20 premium plan still hold value in a highly competitive conversational AI market?",
          content: `
            <h2>The Conversational Benchmark</h2>
            <p>ChatGPT Plus remains the most widely adopted consumer subscription for artificial intelligence. Backed by GPT-4o, it provides advanced voice features, image generation via DALL-E 3, and custom GPT widgets.</p>
            <h3>Custom GPT Store</h3>
            <p>The ability to create and share custom GPTs configured with specific documentation files gives ChatGPT a massive ecosystem advantage.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=800",
          category_id: "40000000-0000-0000-0000-000000000004",
          overall_rating: 4.4,
          scores: { performance: 9.0, value: 8.5, design: 9.0, easeOfUse: 9.0 },
          pros: [
            "Advanced voice mode feels incredibly realistic",
            "Large library of specialized custom GPTs",
            "Fast processing speeds and reliable web browsing",
            "Free tiers offer decent baseline capabilities"
          ],
          cons: [
            "Answers can sometimes feel boilerplate or templated",
            "Token rate-limits apply even to paid users"
          ],
          cta_links: [{ label: "Get ChatGPT Plus", url: "https://chatgpt.com" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "v0 by Vercel",
          slug: "v0-vercel",
          excerpt: "We review Vercel's generative UI assistant that translates prompt descriptions to beautiful React code.",
          content: `
            <h2>Generative Frontend Development</h2>
            <p>v0 by Vercel has emerged as the premier tool for generating frontend layouts. By combining LLM logic with high-quality React, Tailwind CSS, and shadcn/ui components, v0 builds fully interactive, modern interfaces in a matter of seconds.</p>
            <h3>From Prompts to Code</h3>
            <p>You can input raw text descriptions, wireframe sketches, or screenshots, and v0 outputs complete, drop-in React code. It supports multiple versions and iterations, allowing developers to refine components step-by-step.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800",
          category_id: "10000000-0000-0000-0000-000000000001",
          overall_rating: 4.6,
          scores: { performance: 9.0, value: 9.0, design: 9.5, easeOfUse: 9.5 },
          pros: [
            "Generates modern, ready-to-run React/Tailwind code",
            "Seamless integration with shadcn/ui library",
            "Accepts image mockups and sketches as visual input",
            "Interactive live previews for fast testing"
          ],
          cons: [
            "Mainly limited to frontend interface design, no backend logical scripts",
            "Advanced generation features consume credits quickly"
          ],
          cta_links: [{ label: "Try v0.dev", url: "https://v0.dev" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "Perplexity Pro",
          slug: "perplexity-pro",
          excerpt: "We test Perplexity's conversational lookup engine and how it bypasses traditional search engine noise.",
          content: `
            <h2>The Search Engine Redefined</h2>
            <p>Perplexity Pro is a conversational search engine that synthesizes reliable web resources into direct answers with inline citations. It aims to eliminate traditional search query advertisements and link-clutter.</p>
            <h3>Multi-Model Versatility</h3>
            <p>Subscribers get access to a selection of premier language models (such as Claude 3.5 Sonnet and GPT-4o), letting users choose the optimal engine for their specific research threads.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
          category_id: "40000000-0000-0000-0000-000000000004",
          overall_rating: 4.6,
          scores: { performance: 9.0, value: 9.3, design: 9.2, easeOfUse: 9.2 },
          pros: [
            "Accurate inline citations for every synthesized assertion",
            "Access to Claude 3.5 Sonnet and GPT-4o in one subscription",
            "Copilot mode guides research with targeted follow-up questions",
            "Clutter-free research summaries save search time"
          ],
          cons: [
            "Can occasionally synthesize conflicting online sources",
            "Relies on public pages (cannot parse paywalled content)"
          ],
          cta_links: [{ label: "Access Perplexity", url: "https://perplexity.ai" }],
          compare_with: [],
          status: "published"
        },
        {
          title: "GitHub Copilot",
          slug: "github-copilot",
          excerpt: "Is the grandfather of AI autocomplete still worth the investment for individual programmers?",
          content: `
            <h2>Seamless Autocomplete Integration</h2>
            <p>GitHub Copilot is the industry standard tool for inline autocomplete. Operating inside your favorite IDE, it predicts code blocks, fills parameter structures, and generates unit tests on the fly.</p>
            <h3>Inline Autocomplete vs Chat</h3>
            <p>While Cursor and chat interfaces excel at multi-file architecture, Copilot wins in raw speed for simple inline predictions as you write code manually.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
          category_id: "10000000-0000-0000-0000-000000000001",
          overall_rating: 4.3,
          scores: { performance: 8.8, value: 8.5, design: 8.0, easeOfUse: 8.8 },
          pros: [
            "Incredibly fast inline autocomplete prediction",
            "Supports almost all major languages and code editors",
            "Vast dataset ensures high accuracy for common APIs",
            "Reasonable monthly pricing for developers"
          ],
          cons: [
            "Lacks codebase-wide edit planning of newer tools",
            "Often outputs outdated syntax or patterns"
          ],
          cta_links: [{ label: "Get Copilot", url: "https://github.com/features/copilot" }],
          compare_with: [],
          status: "published"
        }
      ];

      for (const review of reviews) {
        const { error } = await supabaseAdmin.from("reviews").upsert(review, { onConflict: "slug" });
        if (error) throw error;
      }

      // 3. Seed Rich Editorial Blog Posts
      const posts = [
        {
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
        },
        {
          title: "How to Write Prompts for Midjourney: An Editorial Guide",
          slug: "midjourney-prompting-guide",
          excerpt: "A descriptive guide to writing prompts that translate to photorealistic results without complex parameters.",
          content: `
            <p>With Midjourney v6, prompt engineering has shifted from code-like tags to descriptive, literary writing. In this guide, we show you how to structure prompts to get the best photorealistic camera shots, lighting, and texture detail.</p>
            <h3>Structure of a V6 Prompt</h3>
            <p>Instead of appending '--ar 16:9' or 'photorealistic 8k' everywhere, try describing the scene as if writing a novel. Focus on light placement, lenses, and historical eras for natural renders.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
          category_id: "20000000-0000-0000-0000-000000000002",
          tags: ["Design", "Generative Art", "Tutorial"],
          status: "published",
          views: 92,
          meta_title: "Mastering Midjourney v6 Prompt Structure",
          meta_description: "Learn how to write descriptive prompts in Midjourney v6 for realism. Avoid obsolete keywords and tags.",
        },
        {
          title: "Can AI Writers Truly Replace Human Editors?",
          slug: "ai-writers-vs-human-editors",
          excerpt: "An investigation into the limits of LLM copywriting and the irreplaceable value of human perspective.",
          content: `
            <p>As LLMs become cheaper and faster, the internet is flooded with robotic SEO listicles. But does AI content truly engage human readers? We look at why editorial voice, first-hand experience, and styling nuance remain irreplaceable.</p>
            <blockquote>"AI can write a draft in seconds, but it cannot go out, purchase a product, and test it for months."</blockquote>
            <p>Our final conclusion is that the future belongs to hybrid editors: writers who utilize LLMs for drafts, but inject true human experience and voice into the final piece.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
          category_id: "30000000-0000-0000-0000-000000000003",
          tags: ["AI Writing", "SEO", "Opinion"],
          status: "published",
          views: 245,
          meta_title: "AI Writing vs Human Editors: The Future of Copywriting",
          meta_description: "We investigate if AI tools like Jasper and ChatGPT can replace editors. Exploring why editorial trust remains essential.",
        },
        {
          title: "The Rise of Agentic Workflows: What Lies Beyond Chatbots",
          slug: "rise-of-agentic-workflows",
          excerpt: "Moving from simple query-and-response chatbots to independent AI agents capable of planning and executing pipelines.",
          content: `
            <p>The conversation is shifting. We are moving away from chatbot interfaces where users must prompt every step, toward autonomous agents. These systems plan workflows, verify their output, and handle complex jobs across databases and APIs.</p>
            <h3>What is an Agentic Loop?</h3>
            <p>An agentic system can run a compiler, look at error codes, read documentation, and revise its own code continuously until a specific goal is achieved.</p>
          `,
          featured_image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=800",
          category_id: "40000000-0000-0000-0000-000000000004",
          tags: ["AI Agents", "Tech Trends", "Logic"],
          status: "published",
          views: 182,
          meta_title: "Understanding Agentic AI Workflows (2026 Guide)",
          meta_description: "Learn what AI agents are, how recursive reasoning loops work, and why they will replace standard chatbot interfaces.",
        }
      ];

      for (const post of posts) {
        const { error } = await supabaseAdmin.from("posts").upsert(post, { onConflict: "slug" });
        if (error) throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Rich mock database successfully seeded with 4 categories, 6 reviews, and 4 blog posts.",
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported actions: createAdmin, seedData" }, { status: 400 });
  } catch (error: any) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to set up" }, { status: 500 });
  }
}
