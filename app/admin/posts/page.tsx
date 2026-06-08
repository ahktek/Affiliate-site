"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Post } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function PostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt || "",
        featuredImage: p.featured_image || "",
        category: p.categories?.name || "",
        tags: p.tags || [],
        status: p.status as "draft" | "scheduled" | "published" | "archived",
        scheduledAt: p.scheduled_at || "",
        publishedAt: p.published_at || "",
        archivedAt: p.archived_at || "",
        authorId: p.author_id || "",
        createdAt: new Date(p.created_at || Date.now()).getTime(),
        updatedAt: new Date(p.updated_at || Date.now()).getTime(),
        metaTitle: p.meta_title || "",
        metaDescription: p.meta_description || "",
        views: p.views || 0,
      })) as Post[];

      setPosts(mapped);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (error) throw error;
        setPosts(posts.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const renderStatusBadge = (post: any) => {
    const status = post.status;
    if (status === "published") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Published
        </span>
      );
    }
    if (status === "scheduled") {
      const dateStr = post.scheduledAt 
        ? new Date(post.scheduledAt).toLocaleDateString() + " " + new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4 mr-2" /> New Post
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">Loading...</TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-zinc-500">No posts found.</TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    {renderStatusBadge(post)}
                  </TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(post.id)}>
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
