"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Editor from "@/components/admin/Editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revalidatePaths } from "@/app/actions/revalidate";


export default function EditPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published" | "archived">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [archivedAt, setArchivedAt] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<number | "">("");

  useEffect(() => {
    if (!postId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories
        const { data: catData, error: catErr } = await supabase.from("categories").select("id, name");
        if (catErr) throw catErr;
        if (catData) setCategories(catData);

        // 2. Fetch post details
        const { data: postData, error: postErr } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .maybeSingle();

        if (postErr) throw postErr;
        if (!postData) {
          alert("Post not found");
          router.push("/admin/posts");
          return;
        }

        setTitle(postData.title || "");
        setSlug(postData.slug || "");
        setContent(postData.content || "");
        setExcerpt(postData.excerpt || "");
        setCategoryId(postData.category_id || "");
        setStatus(postData.status || "draft");
        setIsFeatured(postData.is_featured || false);
        setFeaturedOrder(postData.featured_order || "");
        
        if (postData.scheduled_at) {
          const d = new Date(postData.scheduled_at);
          const pad = (n: number) => n.toString().padStart(2, '0');
          setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
        setPublishedAt(postData.published_at || "");
        setArchivedAt(postData.archived_at || "");
      } catch (err) {
        console.error("Error loading post data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [postId, router]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(e.target.value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postId) return;
    setSaving(true);

    try {
      const now = new Date().toISOString();
      const updatedPost = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId || null,
        status,
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        published_at: status === "published" ? (publishedAt || now) : (status === "scheduled" ? null : (publishedAt || null)),
        archived_at: status === "archived" ? (archivedAt || now) : null,
        is_featured: isFeatured,
        featured_order: isFeatured && featuredOrder !== "" ? Number(featuredOrder) : null,
        meta_title: title,
        meta_description: excerpt,
        updated_at: now,
      };

      const { error } = await supabase
        .from("posts")
        .update(updatedPost)
        .eq("id", postId);

      if (error) throw error;
      
      // Revalidate cache on-demand for related pages
      await revalidatePaths(["/", "/blog", `/blog/${slug}`]);

      router.push("/admin/posts");
    } catch (error: any) {
      console.error("Error updating post:", error);
      alert("Failed to update post: " + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  const getMinDateTime = () => {
    const minDate = new Date(Date.now() + 15 * 60 * 1000); // Now + 15 mins
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${minDate.getFullYear()}-${pad(minDate.getMonth() + 1)}-${pad(minDate.getDate())}T${pad(minDate.getHours())}:${pad(minDate.getMinutes())}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading post data...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={handleTitleChange} placeholder="Enter post title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-url-slug" required />
              </div>
              <div className="space-y-2 h-96">
                <Label>Content</Label>
                <Editor value={content} onChange={setContent} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>SEO Data</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt / Meta Description</Label>
                <Input id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary for search engines" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Schedule</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "scheduled" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <Label htmlFor="scheduledAt">Schedule Date & Time (Min: now + 15m)</Label>
                  <Input 
                    type="datetime-local" 
                    id="scheduledAt" 
                    min={getMinDateTime()} 
                    value={scheduledAt} 
                    onChange={(e) => setScheduledAt(e.target.value)} 
                    required 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-zinc-300 h-4 w-4 accent-primary"
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">Add to Editor's Picks</Label>
                </div>

                {isFeatured && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <Label htmlFor="featuredOrder">Featured Order (1-5)</Label>
                    <Input
                      type="number"
                      id="featuredOrder"
                      min={1}
                      max={5}
                      value={featuredOrder}
                      onChange={(e) => setFeaturedOrder(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 1"
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
