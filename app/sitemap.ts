import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com'; // Change to actual domain

  // Fetch all published posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("slug, updated_at, created_at")
    .eq("status", "published");
  
  const posts = (postsData || []).map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Fetch all published reviews
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("slug, updated_at, created_at")
    .eq("status", "published");

  const reviews = (reviewsData || []).map(r => ({
    url: `${baseUrl}/reviews/${r.slug}`,
    lastModified: new Date(r.updated_at || r.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Fetch all categories
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("slug, created_at");

  const categories = (categoriesData || []).map(c => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(c.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories,
    ...posts,
    ...reviews,
  ];
}
