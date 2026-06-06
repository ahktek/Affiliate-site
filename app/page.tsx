import { supabase } from "@/lib/supabase";
import HomePageClient from "@/components/HomePageClient";

// Revalidate every hour
export const revalidate = 3600;

export default async function Home() {
  // Fetch featured reviews
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
    overallRating: (Number(r.overall_rating) || 0) * 2,
    createdAt: new Date(r.created_at).getTime(),
  }));

  // Fetch recent posts
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

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*");
  
  const categories = (categoriesData || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <HomePageClient
      reviews={reviews}
      posts={posts}
      categories={categories}
    />
  );
}
