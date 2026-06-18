export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  authorId: string;
  createdAt: number;
  updatedAt: number;
  metaTitle: string;
  metaDescription: string;
  views: number;
}

export interface Review {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  overallRating: number; // 1-5
  scores: {
    performance: number; // 0-10
    value: number;       // 0-10
    design: number;      // 0-10
    easeOfUse: number;   // 0-10
  };
  pros: string[];
  cons: string[];
  ctaLinks: { label: string; url: string }[];
  compareWith: string[]; // array of review IDs
  status: 'draft' | 'published';
  authorId: string;
  createdAt: number;
  updatedAt: number;
  metaTitle: string;
  metaDescription: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId: string | null;
  createdAt: number;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  source: string;
  timestamp: number;
  isVerified: boolean;
}

export interface UserReview {
  id: string;
  productId: string; // matches a Review id
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
  isApproved: boolean;
}

export interface UserProfile {
  id: string; // corresponds to Firebase Auth UID
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface Author {
  id: string;
  slug: string;
  displayName: string;
  title: string | null;
  avatarUrl: string | null;
  bio: string | null;
  credentials: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  createdAt: number;
}
