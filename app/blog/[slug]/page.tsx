import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import Script from "next/script";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const postsSnapshot = await adminDb.collection("posts").where("slug", "==", params.slug).limit(1).get();
  
  if (postsSnapshot.empty) {
    return { title: "Post Not Found" };
  }
  
  const post = postsSnapshot.docs[0].data();
  return {
    title: `${post.metaTitle || post.title} | AI Reviews`,
    description: post.metaDescription || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const postsSnapshot = await adminDb.collection("posts").where("slug", "==", params.slug).limit(1).get();
  
  if (postsSnapshot.empty) {
    notFound();
  }
  
  const post = { id: postsSnapshot.docs[0].id, ...postsSnapshot.docs[0].data() } as any;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": new Date(post.createdAt).toISOString(),
    "dateModified": new Date(post.updatedAt).toISOString(),
    "author": [{
      "@type": "Person",
      "name": "Admin" // You can fetch author details here
    }]
  };

  return (
    <article className="container mx-auto py-16 px-4 max-w-3xl">
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header className="mb-10 text-center">
        <div className="text-sm font-medium text-primary mb-4">{post.category}</div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{post.title}</h1>
        <div className="text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString()} • {Math.ceil(post.content.length / 1000)} min read
        </div>
      </header>

      <div 
        className="prose prose-zinc dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <div className="mt-16 border-t pt-8">
        <h3 className="font-bold text-xl mb-4">Enjoyed this article?</h3>
        <p className="text-muted-foreground mb-4">Subscribe to our newsletter to get more insights like this delivered to your inbox.</p>
        <form action="/api/subscribe" method="POST" className="flex gap-2 max-w-md">
          <input type="hidden" name="source" value={`blog-${post.slug}`} />
          <input 
            type="email" 
            name="email" 
            placeholder="Enter your email" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required 
          />
          <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2">
            Subscribe
          </button>
        </form>
      </div>
    </article>
  );
}
