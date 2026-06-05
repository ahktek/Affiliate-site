import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 3600;

export const metadata = {
  title: "Blog | AI Tools & SaaS Insights",
  description: "Read our latest articles on AI tools, SEO software, and digital marketing strategies.",
};

export default async function BlogListingPage() {
  const postsSnapshot = await adminDb.collection("posts")
    .where("status", "==", "published")
    .orderBy("createdAt", "desc")
    .get();
    
  const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-4">Blog</h1>
      <p className="text-xl text-muted-foreground mb-12">Insights, guides, and news about the tools that shape the future.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <Card key={post.id} className="overflow-hidden hover:border-primary/50 transition-colors">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative">
              {/* Image placeholder */}
            </div>
            <CardHeader>
              <span className="text-xs font-medium text-primary mb-2">{post.category}</span>
              <CardTitle className="line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3 text-sm">
                {post.excerpt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
