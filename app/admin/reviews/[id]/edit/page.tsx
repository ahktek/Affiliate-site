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


export default function EditReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;

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
  
  // Review specific
  const [overallRating, setOverallRating] = useState("4.5");
  const [performance, setPerformance] = useState("9");
  const [value, setValue] = useState("8");
  const [design, setDesign] = useState("9");
  const [easeOfUse, setEaseOfUse] = useState("8");
  const [prosText, setProsText] = useState("");
  const [consText, setConsText] = useState("");
  const [affiliateLabel, setAffiliateLabel] = useState("Check Price");
  const [affiliateUrl, setAffiliateUrl] = useState("");

  useEffect(() => {
    if (!reviewId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories
        const { data: catData, error: catErr } = await supabase.from("categories").select("id, name");
        if (catErr) throw catErr;
        if (catData) setCategories(catData);

        // 2. Fetch review details
        const { data: revData, error: revErr } = await supabase
          .from("reviews")
          .select("*")
          .eq("id", reviewId)
          .maybeSingle();

        if (revErr) throw revErr;
        if (!revData) {
          alert("Review not found");
          router.push("/admin/reviews");
          return;
        }

        setTitle(revData.title || "");
        setSlug(revData.slug || "");
        setContent(revData.content || "");
        setExcerpt(revData.excerpt || "");
        setCategoryId(revData.category_id || "");
        setStatus(revData.status || "draft");
        setIsFeatured(revData.is_featured || false);
        setFeaturedOrder(revData.featured_order || "");
        
        if (revData.scheduled_at) {
          const d = new Date(revData.scheduled_at);
          const pad = (n: number) => n.toString().padStart(2, '0');
          setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
        }
        setPublishedAt(revData.published_at || "");
        setArchivedAt(revData.archived_at || "");

        setOverallRating(String(revData.overall_rating || "4.5"));
        
        const sc = revData.scores || {};
        setPerformance(String(sc.performance || "9"));
        setValue(String(sc.value || "8"));
        setDesign(String(sc.design || "9"));
        setEaseOfUse(String(sc.easeOfUse || "8"));
        
        setProsText((revData.pros || []).join("\n"));
        setConsText((revData.cons || []).join("\n"));
        
        const ctas = revData.cta_links || [];
        if (ctas.length > 0) {
          setAffiliateLabel(ctas[0].label || "Check Price");
          setAffiliateUrl(ctas[0].url || "");
        } else {
          setAffiliateLabel("Check Price");
          setAffiliateUrl("");
        }
      } catch (err) {
        console.error("Error loading review data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [reviewId, router]);

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
    if (!user || !reviewId) return;
    setSaving(true);

    try {
      const pros = prosText.split("\n").map(p => p.trim()).filter(p => p !== "");
      const cons = consText.split("\n").map(c => c.trim()).filter(c => c !== "");

      const now = new Date().toISOString();
      const updatedReview = {
        title,
        slug,
        content,
        excerpt,
        category_id: categoryId || null,
        overall_rating: parseFloat(overallRating),
        scores: {
          performance: parseFloat(performance),
          value: parseFloat(value),
          design: parseFloat(design),
          easeOfUse: parseFloat(easeOfUse),
        },
        pros,
        cons,
        cta_links: affiliateUrl ? [{ label: affiliateLabel, url: affiliateUrl }] : [],
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
        .from("reviews")
        .update(updatedReview)
        .eq("id", reviewId);

      if (error) throw error;
      
      // Revalidate cache on-demand for related pages
      await revalidatePaths(["/", "/reviews", `/reviews/${slug}`]);

      router.push("/admin/reviews");
    } catch (error: any) {
      console.error("Error updating review:", error);
      alert("Failed to update review: " + (error.message || error));
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
    return <div className="p-8 text-center text-zinc-500">Loading review data...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Review</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Review"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={title} onChange={handleTitleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
              </div>
              <div className="space-y-2 h-96">
                <Label>Review Content</Label>
                <Editor value={content} onChange={setContent} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Pros & Cons (One per line)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pros</Label>
                <textarea 
                  className="w-full h-32 p-2 border rounded-md dark:bg-zinc-900" 
                  value={prosText} 
                  onChange={(e) => setProsText(e.target.value)}
                  placeholder="Fast performance&#10;Easy to use"
                />
              </div>
              <div className="space-y-2">
                <Label>Cons</Label>
                <textarea 
                  className="w-full h-32 p-2 border rounded-md dark:bg-zinc-900" 
                  value={consText} 
                  onChange={(e) => setConsText(e.target.value)}
                  placeholder="Expensive&#10;Steep learning curve"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Scores & Rating</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Overall Rating (1-5)</Label>
                <Input type="number" step="0.1" max="5" min="1" value={overallRating} onChange={(e) => setOverallRating(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Performance (1-10)</Label>
                  <Input type="number" value={performance} onChange={(e) => setPerformance(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Value (1-10)</Label>
                  <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Design (1-10)</Label>
                  <Input type="number" value={design} onChange={(e) => setDesign(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ease of Use (1-10)</Label>
                  <Input type="number" value={easeOfUse} onChange={(e) => setEaseOfUse(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Affiliate Link</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CTA Label</Label>
                <Input value={affiliateLabel} onChange={(e) => setAffiliateLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Affiliate URL</Label>
                <Input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Publish Settings</CardTitle></CardHeader>
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
