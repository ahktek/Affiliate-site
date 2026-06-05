import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com'; // Change to actual domain

  // Fetch all published posts
  const postsSnapshot = await adminDb.collection("posts")
    .where("status", "==", "published")
    .get();
  
  const posts = postsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      url: `${baseUrl}/blog/${data.slug}`,
      lastModified: new Date(data.updatedAt || data.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  // Fetch all published reviews
  const reviewsSnapshot = await adminDb.collection("reviews")
    .where("status", "==", "published")
    .get();

  const reviews = reviewsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      url: `${baseUrl}/reviews/${data.slug}`,
      lastModified: new Date(data.updatedAt || data.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    };
  });

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
    ...posts,
    ...reviews,
  ];
}
