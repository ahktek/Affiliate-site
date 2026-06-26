const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local file not found at:', envPath);
    process.exit(1);
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const index = trimmed.indexOf('=');
    if (index === -1) return;
    
    let key = trimmed.substring(0, index).trim();
    let val = trimmed.substring(index + 1).trim();
    
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    
    env[key] = val;
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing URL or service role key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

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

const aiTools = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    slug: "cursor-ai",
    name: "Cursor AI",
    tagline: "The AI-first Code Editor built for programming efficiency",
    official_url: "https://cursor.com",
    affiliate_url: "https://cursor.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800"],
    category: "Coding",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: true,
    overall_score: 9.2,
    accuracy_score: 9.5,
    speed_score: 9.0,
    ease_of_use_score: 9.5,
    value_score: 9.0,
    best_for: ["Developers", "Startups", "Software Engineers"],
    integrations: ["VS Code Extensions", "GitHub", "Copilot"],
    context_window: "128k tokens",
    pros: ["Composer mode edits multiple files", "Instant codebase index", "Supports Claude & GPT-4o"],
    cons: ["Sub can be costly for heavy users", "Memory-heavy"],
    limitations: "Composer edits can occasionally mismatch file imports if context size limits are breached.",
    verdict: "highly-recommended",
    verdict_summary: "Cursor is currently the best overall code editor for programmers seeking direct context-aware code generations.",
    review_content: "<p>Cursor is built on VS Code, allowing you to import your settings instantly...</p>",
    meta_title: "Cursor AI Review: The Best Code Editor",
    meta_description: "We review Cursor, the VS Code fork that integrates Claude 3.5 Sonnet directly.",
    is_featured: true,
    featured_order: 1
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    slug: "claude-sonnet",
    name: "Claude 3.5 Sonnet",
    tagline: "Anthropic's flagship reasoning model setting new standards",
    official_url: "https://claude.ai",
    affiliate_url: "https://claude.ai?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800"],
    category: "Research",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: true,
    overall_score: 9.4,
    accuracy_score: 9.8,
    speed_score: 9.2,
    ease_of_use_score: 9.0,
    value_score: 9.5,
    best_for: ["Researchers", "Writers", "Developers"],
    integrations: ["API Access", "Amazon Bedrock", "Google Cloud Vertex"],
    context_window: "200k tokens",
    pros: ["Superb logic reasoning", "Natural writing tone", "Fast processing speed"],
    cons: ["Rate limits apply", "No search engine natively"],
    limitations: "Knowledge cutoff and lack of real-time search limits its use for news reporting.",
    verdict: "highly-recommended",
    verdict_summary: "Claude 3.5 Sonnet is our top pick for logical code reasoning and natural-tone copywriting.",
    review_content: "<p>Claude has surpassed GPT-4 in logic benchmarks...</p>",
    meta_title: "Claude 3.5 Sonnet Review: Top Reasoning LLM",
    meta_description: "Deep dive review of Claude 3.5 Sonnet, analyzing code output and writing voice.",
    is_featured: true,
    featured_order: 2
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    slug: "midjourney-v6",
    name: "Midjourney v6",
    tagline: "Stunning generative photography and photorealism",
    official_url: "https://midjourney.com",
    affiliate_url: "https://midjourney.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"],
    category: "Image Gen",
    status: "published",
    pricing_model: "paid",
    has_free_tier: false,
    starting_price: "$10/mo",
    api_available: false,
    overall_score: 8.9,
    accuracy_score: 9.6,
    speed_score: 8.5,
    ease_of_use_score: 7.5,
    value_score: 9.0,
    best_for: ["Designers", "Artists", "Creative Directors"],
    integrations: ["Discord", "Web Editor Panel"],
    context_window: "N/A",
    pros: ["Incredible photo fidelity", "Text rendering support", "Precise detail mapping"],
    cons: ["Clumsy Discord interface", "No free tier"],
    limitations: "Requires Discord for full command outputs, though a web interface is emerging.",
    verdict: "recommended",
    verdict_summary: "Midjourney remains the absolute gold standard for photorealistic digital illustrations.",
    review_content: "<p>Midjourney v6 brings sharp skin textures and text layouts...</p>",
    meta_title: "Midjourney v6 Review: Generative Art Leader",
    meta_description: "We test Midjourney v6 photorealism and text layout options in prompts.",
    is_featured: true,
    featured_order: 3
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    slug: "jasper-ai",
    name: "Jasper AI",
    tagline: "Enterprise copywriting and campaign alignment tool",
    official_url: "https://jasper.ai",
    affiliate_url: "https://jasper.ai?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"],
    category: "Writing",
    status: "published",
    pricing_model: "paid",
    has_free_tier: false,
    starting_price: "$39/mo",
    api_available: true,
    overall_score: 8.1,
    accuracy_score: 8.0,
    speed_score: 8.5,
    ease_of_use_score: 8.5,
    value_score: 7.5,
    best_for: ["Marketing Teams", "Content Writers", "Blogger Staff"],
    integrations: ["Surfer SEO", "Chrome Extension"],
    context_window: "8k tokens",
    pros: ["Custom brand voice profiles", "Robust templates list", "SEO content alignment"],
    cons: ["Very expensive", "Generic outputs without tweaking"],
    limitations: "Jasper relies heavily on base OpenAI models, adding template interfaces on top.",
    verdict: "consider",
    verdict_summary: "Jasper is a solid asset for marketing teams, but solo bloggers might find ChatGPT more economical.",
    review_content: "<p>Jasper provides tools to keep marketing campaigns aligned...</p>",
    meta_title: "Jasper AI Review: Marketing Voice Alignment",
    meta_description: "Read our review of Jasper AI, testing brand voice templates and campaign suites.",
    is_featured: true,
    featured_order: 4
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    slug: "chatgpt-plus",
    name: "ChatGPT Plus",
    tagline: "The original conversational AI setting the benchmarks",
    official_url: "https://chatgpt.com",
    affiliate_url: "https://chatgpt.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=800"],
    category: "Productivity",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: true,
    overall_score: 8.8,
    accuracy_score: 9.0,
    speed_score: 9.0,
    ease_of_use_score: 9.0,
    value_score: 8.5,
    best_for: ["General Users", "Students", "Productivity Seekers"],
    integrations: ["DALL-E 3", "Bing Web Search", "Custom GPTs"],
    context_window: "32k tokens",
    pros: ["Excellent voice modes", "Huge custom GPT library", "Fast processing speed"],
    cons: ["Can output robotic templates", "Strict limits during load"],
    limitations: "Context limits apply to file indexing within custom GPT workspaces.",
    verdict: "recommended",
    verdict_summary: "ChatGPT Plus remains the best all-rounder tool for daily productivity and research requests.",
    is_featured: true,
    featured_order: 5
  },
  {
    id: "a0000000-0000-0000-0000-000000000006",
    slug: "github-copilot",
    name: "GitHub Copilot",
    tagline: "Inline AI autocomplete for faster development",
    official_url: "https://github.com",
    affiliate_url: "https://github.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"],
    category: "Coding",
    status: "published",
    pricing_model: "paid",
    has_free_tier: false,
    starting_price: "$10/mo",
    api_available: false,
    overall_score: 8.5,
    accuracy_score: 8.8,
    speed_score: 9.5,
    ease_of_use_score: 8.8,
    value_score: 8.5,
    best_for: ["Developers", "Junior Programmers"],
    integrations: ["VS Code", "JetBrains", "Neovim"],
    context_window: "8k tokens",
    pros: ["Vastly speeds up boilerplate writing", "Great inline autocomplete", "Supports all major IDEs"],
    cons: ["Lacks workspace-wide context", "Occasionally outputs obsolete code"],
    limitations: "Limited to current active file context, cannot modify multiple files at once.",
    verdict: "recommended",
    verdict_summary: "GitHub Copilot is a must-have for developers seeking fast autocomplete in their editors.",
    is_featured: false,
    featured_order: null
  },
  {
    id: "a0000000-0000-0000-0000-000000000007",
    slug: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    tagline: "Google's powerful LLM with a breakthrough 2M token context window",
    official_url: "https://gemini.google.com",
    affiliate_url: "https://gemini.google.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"],
    category: "Research",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: true,
    overall_score: 9.0,
    accuracy_score: 9.2,
    speed_score: 8.8,
    ease_of_use_score: 9.0,
    value_score: 9.0,
    best_for: ["Data Analysts", "Developers", "Researchers"],
    integrations: ["Google Workspace", "Vertex AI", "Firebase"],
    context_window: "2M tokens",
    pros: ["Massive 2 million token context window", "Superb video and audio understanding", "Native integration with Google Workspace"],
    cons: ["Slower reasoning on complex logic than Claude", "Interface can feel cluttered"],
    limitations: "Requires substantial bandwidth to upload large files for analysis.",
    verdict: "recommended",
    verdict_summary: "Gemini 1.5 Pro is the undisputed champion of long-context multi-modal analysis.",
    is_featured: false,
    featured_order: null
  },
  {
    id: "a0000000-0000-0000-0000-000000000008",
    slug: "v0-vercel",
    name: "v0 by Vercel",
    tagline: "Generative UI system that builds React and Tailwind components instantly",
    official_url: "https://v0.dev",
    affiliate_url: "https://v0.dev?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800"],
    category: "Coding",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: false,
    overall_score: 9.1,
    accuracy_score: 9.0,
    speed_score: 9.3,
    ease_of_use_score: 9.5,
    value_score: 9.0,
    best_for: ["Frontend Developers", "UI/UX Designers", "Indie Hackers"],
    integrations: ["Vercel CLI", "GitHub", "Next.js"],
    context_window: "N/A",
    pros: ["Instantly renders interactive UI components", "Outputs clean React + Tailwind CSS code", "Framer Motion support built-in"],
    cons: ["Occasionally hallucinated components or icons", "Premium generations use credits quickly"],
    limitations: "Mainly designed for web interface styling, not backend database scripts.",
    verdict: "highly-recommended",
    verdict_summary: "v0 is a revolutionary utility for frontend devs looking to build layout mockups in seconds.",
    is_featured: true,
    featured_order: 6
  },
  {
    id: "a0000000-0000-0000-0000-000000000009",
    slug: "elevenlabs",
    name: "ElevenLabs",
    tagline: "Ultra-realistic text-to-speech and voice cloning platform",
    official_url: "https://elevenlabs.io",
    affiliate_url: "https://elevenlabs.io?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=800"],
    category: "Audio",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$5/mo",
    api_available: true,
    overall_score: 9.3,
    accuracy_score: 9.7,
    speed_score: 9.0,
    ease_of_use_score: 9.4,
    value_score: 9.2,
    best_for: ["Podcasters", "Video Creators", "Game Developers"],
    integrations: ["API Access", "Python SDK", "Unity Editor"],
    context_window: "N/A",
    pros: ["Uncanny lifelike speech inflection", "Highly accurate voice cloning", "Large library of preset voices"],
    cons: ["Generations consume character quotas quickly", "High tier pricing can be steep for audiobooks"],
    limitations: "Short snippets are near-flawless, but extremely long paragraphs might lose pacing consistency.",
    verdict: "highly-recommended",
    verdict_summary: "ElevenLabs is the industry gold standard for synthetic speech and voice cloning.",
    is_featured: false,
    featured_order: null
  },
  {
    id: "a0000000-0000-0000-0000-000000000010",
    slug: "runway-gen3",
    name: "Runway Gen-3 Alpha",
    tagline: "Cinematic text-to-video and image-to-video AI model",
    official_url: "https://runwayml.com",
    affiliate_url: "https://runwayml.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"],
    category: "Video",
    status: "published",
    pricing_model: "paid",
    has_free_tier: false,
    starting_price: "$15/mo",
    api_available: true,
    overall_score: 8.7,
    accuracy_score: 8.8,
    speed_score: 8.2,
    ease_of_use_score: 8.5,
    value_score: 8.5,
    best_for: ["Filmmakers", "Content Creators", "Animators"],
    integrations: ["Web Dashboard", "API Access"],
    context_window: "N/A",
    pros: ["Highly photorealistic video outputs", "Excellent motion control consistency", "Sharp texture resolution"],
    cons: ["No free tier available", "Render times can be slow during high traffic"],
    limitations: "Complex physics or hand interactions can still show typical AI morphing artifacts.",
    verdict: "recommended",
    verdict_summary: "Gen-3 Alpha is a powerful tool for filmmakers seeking high-fidelity b-roll and cinematic assets.",
    is_featured: false,
    featured_order: null
  },
  {
    id: "a0000000-0000-0000-0000-000000000011",
    slug: "perplexity-pro",
    name: "Perplexity Pro",
    tagline: "Conversational search engine that synthesizes answers with exact citations",
    official_url: "https://perplexity.ai",
    affiliate_url: "https://perplexity.ai?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"],
    category: "Research",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: true,
    overall_score: 9.1,
    accuracy_score: 9.4,
    speed_score: 9.0,
    ease_of_use_score: 9.2,
    value_score: 9.3,
    best_for: ["Researchers", "Writers", "Journalists"],
    integrations: ["API Access", "Chrome Extension"],
    context_window: "32k tokens",
    pros: ["Cites reliable web links instantly", "Clean research thread summaries", "Access to multiple model selection (Claude, GPT-4)"],
    cons: ["Can occasionally synthesize contradictory sources", "Limited follow-ups on the free plan"],
    limitations: "Relies on external web resources, meaning pages behind login/paywalls cannot be analyzed.",
    verdict: "highly-recommended",
    verdict_summary: "Perplexity Pro is the ultimate companion for active research, bypassing general search engine clutter.",
    is_featured: true,
    featured_order: 7
  },
  {
    id: "a0000000-0000-0000-0000-000000000012",
    slug: "phind",
    name: "Phind",
    tagline: "AI Search engine specifically tailored for developers and technical questions",
    official_url: "https://phind.com",
    affiliate_url: "https://phind.com?utm_source=optura_vibe",
    logo_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=150",
    screenshot_urls: ["https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800"],
    category: "Coding",
    status: "published",
    pricing_model: "freemium",
    has_free_tier: true,
    starting_price: "$20/mo",
    api_available: false,
    overall_score: 8.6,
    accuracy_score: 8.8,
    speed_score: 9.0,
    ease_of_use_score: 8.8,
    value_score: 8.7,
    best_for: ["Developers", "DevOps Engineers"],
    integrations: ["VS Code Extension"],
    context_window: "32k tokens",
    pros: ["Directly synthesizes library documentation", "Provides clean runnable code examples", "Fast answers with citations"],
    cons: ["Less polished UI than general chatbots", "Struggles with non-technical queries"],
    limitations: "Strictly optimized for programming, so general knowledge is better suited for other models.",
    verdict: "recommended",
    verdict_summary: "Phind is an excellent technical lookup engine that saves developer research time on StackOverflow.",
    is_featured: false,
    featured_order: null
  }
];

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
  }
];

const heroSlides = [
  {
    slide_order: 1,
    is_active: true,
    headline: "The AI Revolution Deserves Honest Reviews",
    subline: "The world is flooded with AI tools. We test them so you don't waste money.",
    cta_primary_text: "Browse AI Tools",
    cta_primary_url: "/ai-tools",
    cta_secondary_text: "See Latest Reviews",
    cta_secondary_url: "/reviews",
    image_url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Developer desk with screens showing code and AI models",
    overlay_opacity: 0.5,
    overlay_color: "#1a1a18"
  },
  {
    slide_order: 2,
    is_active: true,
    headline: "Find Your Perfect AI Tool in 60 Seconds",
    subline: "Use our Compare Tool to pit top AI tools head-to-head on what matters.",
    cta_primary_text: "Start Comparing",
    cta_primary_url: "/compare",
    cta_secondary_text: "How We Test",
    cta_secondary_url: "/about",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Split-screen software comparison interface on screens",
    overlay_opacity: 0.5,
    overlay_color: "#1a1a18"
  },
  {
    slide_order: 3,
    is_active: true,
    headline: "Editor's Pick: This Month's Top AI Tools",
    subline: "Our editors hand-tested 40+ tools. These 5 made the cut.",
    cta_primary_text: "See Editor's Picks",
    cta_primary_url: "/#editors-picks",
    cta_secondary_text: "Read Full Report",
    cta_secondary_url: "/blog",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
    image_alt: "Warm editorial writing desk with laptop and coffee cup",
    overlay_opacity: 0.4,
    overlay_color: "#1a1a18"
  }
];

const settings = [
  {
    key: "homepageComparison",
    value: {
      productAId: "a0000000-0000-0000-0000-000000000001", // Cursor
      productBId: "a0000000-0000-0000-0000-000000000006", // Copilot
      updatedAt: new Date().toISOString()
    }
  }
];

async function seed() {
  console.log('Seeding Supabase Database...');
  
  try {
    console.log('Upserting categories...');
    for (const cat of categories) {
      await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    }

    console.log('Upserting ai_tools...');
    for (const tool of aiTools) {
      await supabase.from('ai_tools').upsert(tool, { onConflict: 'slug' });
    }

    console.log('Upserting reviews...');
    for (const review of reviews) {
      await supabase.from('reviews').upsert(review, { onConflict: 'slug' });
    }

    console.log('Upserting posts...');
    for (const post of posts) {
      await supabase.from('posts').upsert(post, { onConflict: 'slug' });
    }

    console.log('Upserting hero_slides...');
    for (const slide of heroSlides) {
      await supabase.from('hero_slides').upsert(slide, { onConflict: 'id' });
    }

    console.log('Upserting settings...');
    for (const setting of settings) {
      await supabase.from('settings').upsert(setting, { onConflict: 'key' });
    }

    console.log('All seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Exception during seeding:', err);
    process.exit(1);
  }
}

seed();
