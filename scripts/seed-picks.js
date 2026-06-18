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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedPicks() {
  console.log('Resetting is_featured on existing reviews and posts...');
  await supabase.from('reviews').update({ is_featured: false, featured_order: null }).eq('is_featured', true);
  await supabase.from('posts').update({ is_featured: false, featured_order: null }).eq('is_featured', true);
  
  console.log('Seeding Editor\'s Picks reviews...');
  
  // 1. Claude 3.5 Sonnet Review (featured_order: 1)
  const claudeReview = {
    title: "Claude 3.5 Sonnet Review: The New LLM Benchmark",
    slug: "claude-3-5-sonnet-review",
    content: `
      <h2>Anthropic's Latest Masterpiece Under the Microscope</h2>
      <p>Claude 3.5 Sonnet has taken the AI ecosystem by storm. Anthropic's middle-tier model has not only outpaced its predecessor, Claude 3 Opus, but it also outperforms GPT-4o on various logical and coding tasks. In our hands-on evaluation, we put it to the test on reasoning speed, code generation, and complex logical analysis.</p>
      <h3>Coding and Reasoning Powerhouse</h3>
      <p>Sonnet stands out particularly in code assistance. It exhibits a deep understanding of programming contexts, library documentation, and structures, writing code that is clean, bug-free, and adheres to modern architectural principles. The inclusion of 'Artifacts' makes working with HTML pages, SVG graphics, and React components visual and collaborative.</p>
    `,
    excerpt: "We put Anthropic's Claude 3.5 Sonnet through rigorous benchmarks to test its reasoning, coding prowess, and visual understanding.",
    featured_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    category_id: "40000000-0000-0000-0000-000000000004", // AI Chatbots & Agents
    overall_rating: 4.8,
    scores: { performance: 9.8, value: 9.5, design: 9.0, easeOfUse: 9.5 },
    pros: [
      "Industry-leading code generation accuracy",
      "Significantly faster speed than Claude 3 Opus",
      "Interactive Artifacts feature speeds up frontend prototype design",
      "Highly nuanced, natural conversational voice"
    ],
    cons: [
      "Free-tier rate limits are reached very quickly",
      "Context usage can get expensive on high volumes"
    ],
    cta_links: [{ url: "https://claude.ai", label: "Try Claude 3.5 Sonnet" }],
    status: "published",
    is_featured: true,
    featured_order: 1
  };

  const { error: clErr } = await supabase.from('reviews').upsert(claudeReview, { onConflict: 'slug' });
  if (clErr) console.error('Error seeding Claude review:', clErr);
  else console.log('Successfully upserted Claude 3.5 Sonnet Review');

  // 2. Cursor AI Review (featured_order: 2)
  const cursorReview = {
    title: "Cursor AI Review: The AI-First Code Editor",
    slug: "cursor-ai-review",
    content: `
      <h2>The IDE Designed Around Artificial Intelligence</h2>
      <p>Cursor is a fork of VS Code that integrates artificial intelligence directly into the core editor experience. While standard copilot extensions function as side panels, Cursor index-builds your entire repository, enabling semantic searches, auto-apply multi-file edits, and quick inline code generation.</p>
      <h3>Seamless VS Code Migration</h3>
      <p>Since it's built on top of VS Code, developers can migrate their extensions, keybindings, and themes in a single click. The AI capabilities, powered by Claude 3.5 Sonnet and GPT-4o, feel natively integrated, making code refactoring and boilerplate generation instant.</p>
    `,
    excerpt: "A hands-on review of Cursor, evaluating its deep codebase indexing, auto-edit capabilities, and developer workflow enhancement.",
    featured_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    category_id: "10000000-0000-0000-0000-000000000001", // AI Code Assistants
    overall_rating: 4.7,
    scores: { performance: 9.5, value: 9.0, design: 9.5, easeOfUse: 9.0 },
    pros: [
      "Deep codebase semantic indexing allows queries over all files",
      "Inline edits (Cmd+K) apply changes directly with context",
      "One-click migration preserves all existing VS Code extensions"
    ],
    cons: [
      "Requires monthly subscription for advanced AI features",
      "High rate usage consumes fast credits quickly"
    ],
    cta_links: [{ url: "https://cursor.com", label: "Try Cursor AI" }],
    status: "published",
    is_featured: true,
    featured_order: 2
  };

  const { error: cuErr } = await supabase.from('reviews').upsert(cursorReview, { onConflict: 'slug' });
  if (cuErr) console.error('Error seeding Cursor review:', cuErr);
  else console.log('Successfully upserted Cursor AI Review');

  // 3. Update Midjourney v6 Review (featured_order: 3)
  const { error: mjErr } = await supabase
    .from('reviews')
    .update({ is_featured: true, featured_order: 3 })
    .eq('slug', 'midjourney-v6-review');
  if (mjErr) console.error('Error updating Midjourney review:', mjErr);
  else console.log('Successfully set Midjourney v6 Review as Featured (order: 3)');

  console.log('Seeding Editor\'s Picks posts...');

  // 4. Cursor vs Copilot Comparison Blog Post (featured_order: 4)
  const showdownPost = {
    title: "The AI Code Assistant Showdown: Cursor vs GitHub Copilot",
    slug: "cursor-vs-copilot",
    content: `
      <p>AI-assisted coding is no longer just autocomplete. With developers seeking more contextual help, the battle has intensified between GitHub Copilot (the pioneer) and Cursor AI (the dedicated editor).</p>
      <h3>Core Differences</h3>
      <p>GitHub Copilot is a plug-in that lives within your existing editor (VS Code, JetBrains, etc.). It is excellent for quick suggestions. Cursor, on the other hand, is a standalone code editor built around AI. It reads your entire workspace, allows you to chat with your codebase, and automatically edits files in place.</p>
      <p>In our comparison, we found that while Copilot is easier for developers who do not want to switch editors, Cursor's context awareness and inline edit capabilities make it far superior for heavy refactoring and complex feature builds.</p>
    `,
    excerpt: "An in-depth editorial comparison between the leading AI development tools, analyzing speed, accuracy, and developer preference.",
    featured_image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&q=80&w=800",
    category_id: "10000000-0000-0000-0000-000000000001", // AI Code Assistants
    tags: ["Coding", "Comparison", "AI Tools"],
    status: "published",
    is_featured: true,
    featured_order: 4
  };

  const { error: shErr } = await supabase.from('posts').upsert(showdownPost, { onConflict: 'slug' });
  if (shErr) console.error('Error seeding comparison post:', shErr);
  else console.log('Successfully upserted Cursor vs Copilot Blog Post');

  // 5. Update Midjourney prompting guide post (featured_order: 5)
  const { error: pgErr } = await supabase
    .from('posts')
    .update({ is_featured: true, featured_order: 5 })
    .eq('slug', 'midjourney-prompting-guide');
  if (pgErr) console.error('Error updating Midjourney prompt post:', pgErr);
  else console.log('Successfully set Midjourney prompting guide as Featured (order: 5)');

  console.log('All Editor\'s Picks content successfully seeded!');
}

seedPicks();
