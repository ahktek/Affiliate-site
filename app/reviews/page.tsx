import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export const revalidate = 3600;

export const metadata = {
  title: "Product Reviews | AI Tools & SaaS",
  description: "Read our comprehensive reviews of the top AI tools and SaaS products.",
};

export default async function ReviewsListingPage() {
  const { data } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
    
  const reviews = (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    content: r.content,
    excerpt: r.excerpt,
    featuredImage: r.featured_image,
    category: r.categories?.name || "",
    overallRating: Number(r.overall_rating) || 0,
    scores: r.scores,
    pros: r.pros,
    cons: r.cons,
    ctaLinks: r.cta_links,
    compareWith: r.compare_with,
    status: r.status,
    authorId: r.author_id,
    createdAt: new Date(r.created_at).getTime(),
    updatedAt: new Date(r.updated_at).getTime(),
  }));

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-4">Product Reviews</h1>
      <p className="text-xl text-muted-foreground mb-12">In-depth analysis of the tools that matter.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map((review: any) => (
          <Card key={review.id} className="overflow-hidden hover:border-primary/50 transition-colors">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative">
              {/* Image placeholder */}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-full">
                    {review.category}
                  </span>
                  <CardTitle className="mt-2">
                    <Link href={`/reviews/${review.slug}`} className="hover:underline">
                      {review.title}
                    </Link>
                  </CardTitle>
                </div>
                <div className="flex items-center bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md font-bold text-sm">
                  <Star className="w-4 h-4 mr-1 fill-current" /> {review.overallRating}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {review.excerpt || review.metaDescription}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
