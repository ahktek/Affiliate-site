"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Editor from "@/components/admin/Editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewReviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  
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
    const fetchCats = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, name");
        if (error) throw error;
        if (data) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCats();
  }, []);

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
    if (!user) return;
    setLoading(true);

    try {
      const pros = prosText.split("\n").map(p => p.trim()).filter(p => p !== "");
      const cons = consText.split("\n").map(c => c.trim()).filter(c => c !== "");

      const newReview = {
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
        compare_with: [],
        status,
        author_id: user.id,
        meta_title: title,
        meta_description: excerpt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("reviews").insert(newReview);
      if (error) throw error;
      
      router.push("/admin/reviews");
    } catch (error: any) {
      console.error("Error creating review:", error);
      alert("Failed to create review: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Review</h1>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Review"}
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
                <Select value={status} onValueChange={(v: "draft" | "published") => setStatus(v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
