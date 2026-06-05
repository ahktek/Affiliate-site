import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import Link from "next/link";
import { Check, X, Star, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("title, meta_title, meta_description, excerpt")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) return { title: "Review Not Found" };
  
  return {
    title: `${data.meta_title || data.title} Review (${new Date().getFullYear()}) | AI Reviews`,
    description: data.meta_description || data.excerpt,
  };
}

export default async function SingleReviewPage({ params }: { params: { slug: string } }) {
  const { data } = await supabase
    .from("reviews")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .maybeSingle();
  
  if (!data) notFound();
  
  const review = {
    id: data.id,
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    featuredImage: data.featured_image,
    category: data.categories?.name || "",
    overallRating: Number(data.overall_rating) || 0,
    scores: data.scores,
    pros: data.pros,
    cons: data.cons,
    ctaLinks: data.cta_links,
    compareWith: data.compare_with,
    status: data.status,
    authorId: data.author_id,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    metaTitle: data.meta_title || "",
    metaDescription: data.meta_description || "",
  };

  // JSON-LD Product Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": review.title,
    "description": review.excerpt || review.metaDescription,
    "review": {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.overallRating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Organization",
        "name": "AI Reviews"
      }
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-6">
          <div className="text-sm font-medium text-primary">{review.category}</div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{review.title} Review</h1>
          <p className="text-xl text-muted-foreground">{review.excerpt}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/50 px-3 py-1.5 rounded-lg">
              <span className="text-2xl font-bold mr-2">{review.overallRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-5 h-5 ${star <= review.overallRating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Editor's Choice</span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            {review.ctaLinks?.map((cta: any, i: number) => (
              <Button key={i} size="lg" className="h-12 px-8" asChild>
                <a href={cta.url} target="_blank" rel="noopener noreferrer nofollow">
                  {cta.label} <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-80 flex items-center justify-center border">
          {/* Featured Image */}
          <span className="text-zinc-400">[Product Image]</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <div 
            className="prose prose-zinc dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: review.content }}
          />

          {/* Verdict Box */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Our Verdict</h3>
              <p className="text-muted-foreground mb-6">
                {review.title} is an excellent choice for those looking to maximize their workflow. 
                With an overall rating of {review.overallRating}/5, it stands out in the {review.category} space.
              </p>
              {review.ctaLinks?.[0] && (
                <Button asChild>
                  <a href={review.ctaLinks[0].url} target="_blank" rel="noopener noreferrer nofollow">
                    Try {review.title} Today
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Score Breakdown */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <h3 className="font-bold text-lg border-b pb-2">Score Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Performance", score: review.scores?.performance || 0 },
                  { label: "Value", score: review.scores?.value || 0 },
                  { label: "Design", score: review.scores?.design || 0 },
                  { label: "Ease of Use", score: review.scores?.easeOfUse || 0 }
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-bold">{item.score}/10</span>
                    </div>
                    <Progress value={item.score * 10} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-green-800 dark:text-green-400 mb-4 flex items-center">
                  <Check className="w-5 h-5 mr-2" /> Pros
                </h3>
                <ul className="space-y-2">
                  {review.pros?.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-4 h-4 mr-2 mt-1 text-green-600 dark:text-green-500 shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg text-red-800 dark:text-red-400 mb-4 flex items-center">
                  <X className="w-5 h-5 mr-2" /> Cons
                </h3>
                <ul className="space-y-2">
                  {review.cons?.map((con: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <X className="w-4 h-4 mr-2 mt-1 text-red-600 dark:text-red-500 shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
