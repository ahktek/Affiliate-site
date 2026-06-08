import { supabase } from "@/lib/supabase";
import HomePageClient from "@/components/HomePageClient";
import { preload } from "react-dom";

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  // 1. Fetch Hero Slides (Status: active, sorted by slide_order)
  let heroSlides = [];
  try {
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("slide_order", { ascending: true });
    heroSlides = data || [];
  } catch (e) {
    console.warn("Failed to fetch hero slides from database, falling back to static", e);
  }

  // Preload slide images using native react-dom preload
  if (heroSlides.length > 0) {
    heroSlides.forEach((slide: any) => {
      if (slide.image_url) {
        preload(slide.image_url, { as: "image" });
      }
    });
  } else {
    preload("https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=1200", { as: "image" });
    preload("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200", { as: "image" });
    preload("https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200", { as: "image" });
  }

  // 2. Fetch Latest Reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(8);
  
  const reviews = (reviewsData || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt || r.meta_description || "",
    featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: r.categories?.name || "Uncategorized",
    overallRating: (Number(r.overall_rating) || 0) * 2, // Scale 1-5 to 1-10
    createdAt: new Date(r.created_at).getTime(),
  }));

  // 3. Fetch Recent Posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(6);
    
  const posts = (postsData || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "",
    featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: p.categories?.name || "Uncategorized",
    createdAt: new Date(p.created_at).getTime(),
  }));

  // 4. Fetch Categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*");
  
  const categories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  // 5. Fetch AI Tools for Directory Teaser
  let aiTools: any[] = [];
  try {
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("status", "published")
      .order("overall_score", { ascending: false })
      .limit(6);
    aiTools = (data || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      tagline: t.tagline || "",
      logoUrl: t.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      category: t.category || "AI Tools",
      overallScore: Number(t.overall_score) || 0,
      pricingModel: t.pricing_model || "paid",
    }));
  } catch (e) {
    console.warn("Failed to fetch AI tools for homepage", e);
  }

  // 6. Fetch Editor's Picks (asymmetric grid of 5)
  let editorsPicks: any[] = [];
  try {
    const [
      { data: fReviews },
      { data: fPosts },
      { data: fTools }
    ] = await Promise.all([
      supabase.from("reviews").select("*, categories(name)").eq("is_featured", true).eq("status", "published"),
      supabase.from("posts").select("*, categories(name)").eq("is_featured", true).eq("status", "published"),
      supabase.from("ai_tools").select("*").eq("is_featured", true).eq("status", "published")
    ]);

    const unified = [
      ...(fReviews || []).map((r: any) => ({
        id: r.id,
        type: "review",
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt || r.meta_description || "",
        featuredImage: r.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        category: r.categories?.name || "Uncategorized",
        overallRating: (Number(r.overall_rating) || 0) * 2,
        createdAt: new Date(r.created_at).getTime(),
        featuredOrder: r.featured_order || 99,
      })),
      ...(fPosts || []).map((p: any) => ({
        id: p.id,
        type: "post",
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || "",
        featuredImage: p.featured_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        category: p.categories?.name || "Uncategorized",
        createdAt: new Date(p.created_at).getTime(),
        featuredOrder: p.featured_order || 99,
      })),
      ...(fTools || []).map((t: any) => ({
        id: t.id,
        type: "tool",
        title: t.name,
        slug: t.slug,
        excerpt: t.tagline || "",
        featuredImage: t.logo_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        category: t.category || "AI Tools",
        overallRating: Number(t.overall_score) || 0,
        createdAt: new Date(t.created_at).getTime(),
        featuredOrder: t.featured_order || 99,
      }))
    ];

    unified.sort((a, b) => a.featuredOrder - b.featuredOrder || b.createdAt - a.createdAt);
    editorsPicks = unified.slice(0, 5);
  } catch (e) {
    console.warn("Failed to fetch featured Editor's Picks, using fallback reviews", e);
  }

  // Gracefully fallback Editor's Picks to reviews if fewer than 5 exist
  if (editorsPicks.length < 5) {
    const fallbackReviews = reviews.slice(0, 5);
    const seenIds = new Set(editorsPicks.map(p => p.id));
    for (const fr of fallbackReviews) {
      if (editorsPicks.length >= 5) break;
      if (!seenIds.has(fr.id)) {
        editorsPicks.push({
          ...fr,
          type: "review",
        });
        seenIds.add(fr.id);
      }
    }
  }

  // 7. Fetch Quick Comparison "Head to Head" Settings
  let comparisonProducts: any[] = [];
  try {
    const { data: settingsData } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "homepageComparison")
      .maybeSingle();

    if (settingsData && settingsData.value) {
      const { productAId, productBId } = settingsData.value;
      if (productAId && productBId) {
        const { data: toolsData } = await supabase
          .from("ai_tools")
          .select("*")
          .in("id", [productAId, productBId]);

        if (toolsData && toolsData.length > 0) {
          // Maintain correct order: Product A then Product B
          const prodA = toolsData.find((t: any) => t.id === productAId) || toolsData[0];
          const prodB = toolsData.find((t: any) => t.id === productBId) || toolsData[1] || null;
          comparisonProducts = [prodA, prodB].filter(Boolean);
        }
      }
    }
  } catch (e) {
    console.warn("Failed to fetch homepage comparison setting", e);
  }

  // Fallback comparison products (e.g. Cursor & Copilot) if not configured
  if (comparisonProducts.length < 2 && aiTools.length >= 2) {
    comparisonProducts = [aiTools[0], aiTools[1]];
  }

  return (
    <HomePageClient
      heroSlides={heroSlides}
      reviews={reviews}
      posts={posts}
      categories={categories}
      editorsPicks={editorsPicks}
      comparisonProducts={comparisonProducts}
      aiToolsTeaser={aiTools}
    />
  );
}
