"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Review } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        content: r.content,
        excerpt: r.excerpt || "",
        featuredImage: r.featured_image || "",
        category: r.categories?.name || "",
        overallRating: Number(r.overall_rating) || 0,
        scores: r.scores || { performance: 0, value: 0, design: 0, easeOfUse: 0 },
        pros: r.pros || [],
        cons: r.cons || [],
        ctaLinks: r.cta_links || [],
        compareWith: r.compare_with || [],
        status: r.status as "draft" | "scheduled" | "published" | "archived",
        scheduledAt: r.scheduled_at || "",
        publishedAt: r.published_at || "",
        archivedAt: r.archived_at || "",
        authorId: r.author_id || "",
        createdAt: new Date(r.created_at || Date.now()).getTime(),
        updatedAt: new Date(r.updated_at || Date.now()).getTime(),
        metaTitle: r.meta_title || "",
        metaDescription: r.meta_description || "",
      })) as Review[];

      setReviews(mapped);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
        setReviews(reviews.filter(r => r.id !== id));
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const renderStatusBadge = (review: any) => {
    const status = review.status;
    if (status === "published") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Published
        </span>
      );
    }
    if (status === "scheduled") {
      const dateStr = review.scheduledAt 
        ? new Date(review.scheduledAt).toLocaleDateString() + " " + new Date(review.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" title={`Publishes ${dateStr}`}>
          Publishes {dateStr.split(" ")[0]}
        </span>
      );
    }
    if (status === "archived") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Archived
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
        Draft
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <Button asChild>
          <Link href="/admin/reviews/new">
            <Plus className="w-4 h-4 mr-2" /> New Review
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">Loading...</TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">No reviews found.</TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.title}</TableCell>
                  <TableCell>{review.overallRating} / 5</TableCell>
                  <TableCell>{review.category}</TableCell>
                  <TableCell>
                    {renderStatusBadge(review)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/reviews/${review.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(review.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
