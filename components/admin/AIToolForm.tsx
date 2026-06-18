"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash, Upload, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { revalidatePaths } from "@/app/actions/revalidate";


// Dynamically import Quill to prevent SSR window issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface AIToolFormProps {
  toolId?: string;
  initialData?: any;
}

export default function AIToolForm({ toolId, initialData }: AIToolFormProps) {
  const router = useRouter();
  const isEdit = !!toolId;

  const [showSuccess, setShowSuccess] = useState(false);

  // Form State
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [category, setCategory] = useState("Other");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published" | "archived">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [archivedAt, setArchivedAt] = useState("");

  const [pricingModel, setPricingModel] = useState("paid");
  const [hasFreeTier, setHasFreeTier] = useState(false);
  const [startingPrice, setStartingPrice] = useState("");
  const [apiAvailable, setApiAvailable] = useState(false);

  // Scores sliders
  const [overallScore, setOverallScore] = useState(8.0);
  const [accuracyScore, setAccuracyScore] = useState(8.0);
  const [speedScore, setSpeedScore] = useState(8.0);
  const [easeOfUseScore, setEaseOfUseScore] = useState(8.0);
  const [valueScore, setValueScore] = useState(8.0);

  // Lists
  const [bestFor, setBestFor] = useState<string[]>([]);
  const [bestForInput, setBestForInput] = useState("");
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [integrationsInput, setIntegrationsInput] = useState("");
  
  const [contextWindow, setContextWindow] = useState("");
  const [isContextNA, setIsContextNA] = useState(false);

  const [pros, setPros] = useState<string[]>([""]);
  const [cons, setCons] = useState<string[]>([""]);
  const [limitations, setLimitations] = useState("");
  
  const [verdict, setVerdict] = useState<"highly-recommended" | "recommended" | "consider" | "skip">("recommended");
  const [verdictSummary, setVerdictSummary] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Save draft to localStorage for new tools only
  useEffect(() => {
    if (!isEdit && typeof window !== "undefined") {
      const draft = {
        name,
        slug,
        tagline,
        officialUrl,
        affiliateUrl,
        logoUrl,
        screenshotUrls,
        category,
        status,
        scheduledAt,
        pricingModel,
        hasFreeTier,
        startingPrice,
        apiAvailable,
        overallScore,
        accuracyScore,
        speedScore,
        easeOfUseScore,
        valueScore,
        bestFor,
        integrations,
        contextWindow,
        isContextNA,
        pros,
        cons,
        limitations,
        verdict,
        verdictSummary,
        reviewContent,
        metaTitle,
        metaDescription
      };
      localStorage.setItem("ai-tool-form-draft", JSON.stringify(draft));
    }
  }, [
    isEdit, name, slug, tagline, officialUrl, affiliateUrl, logoUrl, screenshotUrls,
    category, status, scheduledAt, pricingModel, hasFreeTier, startingPrice, apiAvailable,
    overallScore, accuracyScore, speedScore, easeOfUseScore, valueScore, bestFor,
    integrations, contextWindow, isContextNA, pros, cons, limitations, verdict,
    verdictSummary, reviewContent, metaTitle, metaDescription
  ]);

  // Restore draft on mount
  useEffect(() => {
    if (!isEdit && typeof window !== "undefined") {
      const saved = localStorage.getItem("ai-tool-form-draft");
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setName(draft.name || "");
          setSlug(draft.slug || "");
          setTagline(draft.tagline || "");
          setOfficialUrl(draft.officialUrl || "");
          setAffiliateUrl(draft.affiliateUrl || "");
          setLogoUrl(draft.logoUrl || "");
          setScreenshotUrls(draft.screenshotUrls || []);
          setCategory(draft.category || "Other");
          setStatus(draft.status || "draft");
          setScheduledAt(draft.scheduledAt || "");
          setPricingModel(draft.pricingModel || "paid");
          setHasFreeTier(draft.hasFreeTier || false);
          setStartingPrice(draft.startingPrice || "");
          setApiAvailable(draft.apiAvailable || false);
          setOverallScore(Number(draft.overallScore) || 8.0);
          setAccuracyScore(Number(draft.accuracyScore) || 8.0);
          setSpeedScore(Number(draft.speedScore) || 8.0);
          setEaseOfUseScore(Number(draft.easeOfUseScore) || 8.0);
          setValueScore(Number(draft.valueScore) || 8.0);
          setBestFor(draft.bestFor || []);
          setIntegrations(draft.integrations || []);
          setContextWindow(draft.contextWindow || "");
          setIsContextNA(draft.isContextNA || false);
          setPros(draft.pros || [""]);
          setCons(draft.cons || [""]);
          setLimitations(draft.limitations || "");
          setVerdict(draft.verdict || "recommended");
          setVerdictSummary(draft.verdictSummary || "");
          setReviewContent(draft.reviewContent || "");
          setMetaTitle(draft.metaTitle || "");
          setMetaDescription(draft.metaDescription || "");
        } catch (e) {
          console.warn("Failed to parse AI Tool form draft:", e);
        }
      }
    }
  }, [isEdit]);

  // Load initial data for editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setTagline(initialData.tagline || "");
      setOfficialUrl(initialData.official_url || "");
      setAffiliateUrl(initialData.affiliate_url || "");
      setLogoUrl(initialData.logo_url || "");
      setScreenshotUrls(initialData.screenshot_urls || []);
      setCategory(initialData.category || "Other");
      setStatus(initialData.status || "draft");
      
      if (initialData.scheduled_at) {
        const d = new Date(initialData.scheduled_at);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setScheduledAt(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      setPublishedAt(initialData.published_at || "");
      setArchivedAt(initialData.archived_at || "");

      setPricingModel(initialData.pricing_model || "paid");
      setHasFreeTier(initialData.has_free_tier || false);
      setStartingPrice(initialData.starting_price || "");
      setApiAvailable(initialData.api_available || false);

      setOverallScore(Number(initialData.overall_score) || 8.0);
      setAccuracyScore(Number(initialData.accuracy_score) || 8.0);
      setSpeedScore(Number(initialData.speed_score) || 8.0);
      setEaseOfUseScore(Number(initialData.ease_of_use_score) || 8.0);
      setValueScore(Number(initialData.value_score) || 8.0);

      setBestFor(initialData.best_for || []);
      setIntegrations(initialData.integrations || []);
      
      if (initialData.context_window === "N/A" || !initialData.context_window) {
        setContextWindow("");
        setIsContextNA(true);
      } else {
        setContextWindow(initialData.context_window);
        setIsContextNA(false);
      }

      setPros(initialData.pros && initialData.pros.length > 0 ? initialData.pros : [""]);
      setCons(initialData.cons && initialData.cons.length > 0 ? initialData.cons : [""]);
      setLimitations(initialData.limitations || "");
      setVerdict(initialData.verdict || "recommended");
      setVerdictSummary(initialData.verdict_summary || "");
      setReviewContent(initialData.review_content || "");
      setMetaTitle(initialData.meta_title || "");
      setMetaDescription(initialData.meta_description || "");
    }
  }, [initialData]);

  // Sync slug on title change
  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(e.target.value));
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const loadingToast = toast.loading(`Uploading ${file.name}...`);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      if (isLogo) {
        setLogoUrl(publicUrl);
        toast.success("Logo uploaded successfully!", { id: loadingToast });
      } else {
        if (screenshotUrls.length >= 5) {
          toast.error("Maximum of 5 screenshots allowed.", { id: loadingToast });
          return;
        }
        setScreenshotUrls([...screenshotUrls, publicUrl]);
        toast.success("Screenshot uploaded successfully!", { id: loadingToast });
      }
    } catch (err: any) {
      console.error("Storage upload error:", err);
      toast.error("Failed to upload image: " + err.message, { id: loadingToast });
    }
  };

  // Lists Management
  const addBestFor = () => {
    if (bestForInput.trim() && !bestFor.includes(bestForInput.trim())) {
      setBestFor([...bestFor, bestForInput.trim()]);
      setBestForInput("");
    }
  };

  const addIntegration = () => {
    if (integrationsInput.trim() && !integrations.includes(integrationsInput.trim())) {
      setIntegrations([...integrations, integrationsInput.trim()]);
      setIntegrationsInput("");
    }
  };

  // Pros & Cons lists
  const handleProChange = (idx: number, val: string) => {
    const updated = [...pros];
    updated[idx] = val;
    setPros(updated);
  };

  const handleConChange = (idx: number, val: string) => {
    const updated = [...cons];
    updated[idx] = val;
    setCons(updated);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Tool Name and Slug are required.");
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading(isEdit ? "Saving tool updates..." : "Creating new tool...");

    try {
      const cleanPros = pros.map(p => p.trim()).filter(Boolean);
      const cleanCons = cons.map(c => c.trim()).filter(Boolean);
      const now = new Date().toISOString();

      const toolDataPayload = {
        name,
        slug,
        tagline,
        official_url: officialUrl,
        affiliate_url: affiliateUrl,
        logo_url: logoUrl,
        screenshot_urls: screenshotUrls,
        category,
        status,
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        published_at: status === "published" ? (publishedAt || now) : (status === "scheduled" ? null : (publishedAt || null)),
        archived_at: status === "archived" ? (archivedAt || now) : null,
        pricing_model: pricingModel,
        has_free_tier: hasFreeTier,
        starting_price: startingPrice,
        api_available: apiAvailable,
        overall_score: Number(overallScore),
        accuracy_score: Number(accuracyScore),
        speed_score: Number(speedScore),
        ease_of_use_score: Number(easeOfUseScore),
        value_score: Number(valueScore),
        best_for: bestFor,
        integrations,
        context_window: isContextNA ? "N/A" : contextWindow,
        pros: cleanPros,
        cons: cleanCons,
        limitations,
        verdict,
        verdict_summary: verdictSummary,
        review_content: reviewContent,
        meta_title: metaTitle || name,
        meta_description: metaDescription || tagline,
        updated_at: now,
      };

      let queryErr;
      if (isEdit) {
        const { error } = await supabase
          .from("ai_tools")
          .update(toolDataPayload)
          .eq("id", toolId);
        queryErr = error;
      } else {
        const { error } = await supabase
          .from("ai_tools")
          .insert({
            ...toolDataPayload,
            created_at: now,
          });
        queryErr = error;
      }

      if (queryErr) throw queryErr;

      // Revalidate cache on-demand for related pages
      await revalidatePaths(["/", "/ai-tools", "/compare"]);

      // Clear draft on successful save
      if (typeof window !== "undefined") {
        localStorage.removeItem("ai-tool-form-draft");
      }


      toast.success(isEdit ? "AI Tool updated successfully!" : "AI Tool created successfully!", { id: loadingToast });
      
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/admin/ai-tools");
      }, 2000);
    } catch (err: any) {
      console.error("Database save error:", err);
      const errorMsg = err.message || err.details || JSON.stringify(err);
      toast.error(`Failed to save AI Tool: ${errorMsg}`, { 
        id: loadingToast,
        duration: 5000 
      });
    } finally {
      setSaving(false);
    }
  };

  // Min Datetime for Scheduling
  const getMinDateTime = () => {
    const minDate = new Date(Date.now() + 15 * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${minDate.getFullYear()}-${pad(minDate.getMonth() + 1)}-${pad(minDate.getDate())}T${pad(minDate.getHours())}:${pad(minDate.getMinutes())}`;
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 space-y-8">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">{isEdit ? `Edit AI Tool: ${name}` : "Add New AI Tool"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Populate specifications, ratings, pros and cons, and write the editorial review.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save AI Tool"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Core Data */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Basic details */}
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name</Label>
                <Input id="toolName" value={name} onChange={handleNameChange} placeholder="e.g. Claude 3.5 Sonnet" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="toolSlug">URL Slug</Label>
                <Input id="toolSlug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. claude-sonnet" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline (Max 100 chars)</Label>
                <Input id="tagline" maxLength={100} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Brief one-liner describing the tool" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="officialUrl">Official URL</Label>
                  <Input id="officialUrl" type="url" value={officialUrl} onChange={(e) => setOfficialUrl(e.target.value)} placeholder="https://claude.ai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affiliateUrl">Affiliate URL (with UTM params)</Label>
                  <Input id="affiliateUrl" type="url" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="https://claude.ai?utm_source=chronicle" />
                </div>
              </div>

              {/* Upload Logo & Screenshots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-3">
                  <Label>Tool Logo</Label>
                  <div className="flex items-center gap-4">
                    {logoUrl && (
                      <div className="relative w-12 h-12 rounded-[6px] overflow-hidden border border-border">
                        <Image src={logoUrl} alt="Logo preview" fill className="object-cover" />
                      </div>
                    )}
                    <div className="relative flex-1">
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="sr-only" id="logoUpload" />
                      <Label htmlFor="logoUpload" className="flex items-center justify-center gap-2 border border-border border-dashed rounded-[6px] p-3 text-xs font-semibold cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload size={14} /> Upload Logo Image
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Screenshots (Up to 5)</Label>
                  <div className="relative">
                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="sr-only" id="screenshotUpload" disabled={screenshotUrls.length >= 5} />
                    <Label htmlFor="screenshotUpload" className={`flex items-center justify-center gap-2 border border-border border-dashed rounded-[6px] p-3 text-xs font-semibold cursor-pointer hover:border-primary/50 transition-colors ${screenshotUrls.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <Upload size={14} /> Upload Screenshot ({screenshotUrls.length}/5)
                    </Label>
                  </div>
                  {screenshotUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {screenshotUrls.map((url, idx) => (
                        <div key={url} className="relative w-14 h-10 rounded border border-border overflow-hidden group">
                          <Image src={url} alt={`Screenshot ${idx + 1}`} fill className="object-cover" />
                          <button type="button" onClick={() => setScreenshotUrls(screenshotUrls.filter(s => s !== url))} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pros & Cons */}
          <Card>
            <CardHeader><CardTitle>Pros & Cons (Hand-tested details)</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="flex justify-between items-center">
                  <span>Pros List</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setPros([...pros, ""])}>Add Row</Button>
                </Label>
                {pros.map((pro, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={pro} onChange={(e) => handleProChange(idx, e.target.value)} placeholder="e.g. Superb reasoning logic" />
                    {pros.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setPros(pros.filter((_, i) => i !== idx))}>
                        <Trash size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <Label className="flex justify-between items-center">
                  <span>Cons List</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setCons([...cons, ""])}>Add Row</Button>
                </Label>
                {cons.map((con, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input value={con} onChange={(e) => handleConChange(idx, e.target.value)} placeholder="e.g. Costly subscription tiers" />
                    {cons.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setCons(cons.filter((_, i) => i !== idx))}>
                        <Trash size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-border pt-6">
                <Label htmlFor="limitations">Limitations (Brief text)</Label>
                <Textarea id="limitations" value={limitations} onChange={(e) => setLimitations(e.target.value)} placeholder="e.g. Has strict message rate limits on Sonnet web-tier." />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Full Review rich editor */}
          <Card>
            <CardHeader><CardTitle>Full Review Content</CardTitle></CardHeader>
            <CardContent className="space-y-2 h-[450px] pb-14">
              <Label>Editorial Body (Quill Editor)</Label>
              <ReactQuill value={reviewContent} onChange={setReviewContent} className="h-80" />
            </CardContent>
          </Card>

          {/* Section 4: SEO Metadata */}
          <Card>
            <CardHeader><CardTitle>SEO Optimization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">SEO Title Tag</Label>
                <Input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Defaults to Tool Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDesc">SEO Meta Description</Label>
                <Textarea id="metaDesc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Defaults to tagline" />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Col - Settings, Ratings, Specs */}
        <div className="space-y-8">
          
          {/* Slide 1: Scores with ring previews */}
          <Card>
            <CardHeader><CardTitle>Scores (Sliders 0-10)</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              
              {/* Score ring mockup */}
              <div className="flex items-center justify-center p-4 bg-secondary/30 rounded-md border border-border gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center font-display font-extrabold text-xl text-primary bg-background shadow-inner">
                  {overallScore.toFixed(1)}
                </div>
                <div className="flex-1">
                  <span className="font-sans text-xs uppercase font-semibold text-muted-foreground block">Overall rating</span>
                  <span className="font-body text-xs text-foreground font-semibold">Live score slider sync</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="flex justify-between text-xs"><span>Overall Score</span><span className="font-mono">{overallScore.toFixed(1)}</span></Label>
                  <input type="range" min={0} max={10} step={0.1} value={overallScore} onChange={(e) => setOverallScore(parseFloat(e.target.value))} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                
                <div className="space-y-1 border-t border-border pt-4">
                  <Label className="flex justify-between text-xs"><span>Accuracy Score</span><span className="font-mono">{accuracyScore.toFixed(1)}</span></Label>
                  <input type="range" min={0} max={10} step={0.1} value={accuracyScore} onChange={(e) => setAccuracyScore(parseFloat(e.target.value))} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <div className="space-y-1">
                  <Label className="flex justify-between text-xs"><span>Speed/Performance</span><span className="font-mono">{speedScore.toFixed(1)}</span></Label>
                  <input type="range" min={0} max={10} step={0.1} value={speedScore} onChange={(e) => setSpeedScore(parseFloat(e.target.value))} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <div className="space-y-1">
                  <Label className="flex justify-between text-xs"><span>Ease of Use</span><span className="font-mono">{easeOfUseScore.toFixed(1)}</span></Label>
                  <input type="range" min={0} max={10} step={0.1} value={easeOfUseScore} onChange={(e) => setEaseOfUseScore(parseFloat(e.target.value))} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>

                <div className="space-y-1">
                  <Label className="flex justify-between text-xs"><span>Value for Money</span><span className="font-mono">{valueScore.toFixed(1)}</span></Label>
                  <input type="range" min={0} max={10} step={0.1} value={valueScore} onChange={(e) => setValueScore(parseFloat(e.target.value))} className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide 2: Pricing Matrix */}
          <Card>
            <CardHeader><CardTitle>Pricing Specifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pricingModel">Pricing Model</Label>
                <Select value={pricingModel} onValueChange={setPricingModel}>
                  <SelectTrigger id="pricingModel"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (e.g. $20/mo)</Label>
                <Input id="startingPrice" value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="e.g. Free or $20/mo" />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="freeTier" checked={hasFreeTier} onChange={(e) => setHasFreeTier(e.target.checked)} className="rounded border-zinc-300 h-4 w-4 accent-primary" />
                <Label htmlFor="freeTier" className="cursor-pointer text-xs">Free Tier Available</Label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="apiAvailable" checked={apiAvailable} onChange={(e) => setApiAvailable(e.target.checked)} className="rounded border-zinc-300 h-4 w-4 accent-primary" />
                <Label htmlFor="apiAvailable" className="cursor-pointer text-xs">Developer API Access Available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Slide 3: Settings & Taxonomy */}
          <Card>
            <CardHeader><CardTitle>Taxonomy & Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Publish Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label htmlFor="scheduledAt">Schedule Date & Time</Label>
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
                <Label htmlFor="category">Directory Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Coding">Coding</SelectItem>
                    <SelectItem value="Image Gen">Image Gen</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Best For Tag Input */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label>Best For (Target Audience Tags)</Label>
                <div className="flex gap-2">
                  <Input value={bestForInput} onChange={(e) => setBestForInput(e.target.value)} placeholder="e.g. Designers" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBestFor())} />
                  <Button type="button" variant="secondary" onClick={addBestFor}>Add</Button>
                </div>
                {bestFor.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {bestFor.map(tag => (
                      <span key={tag} className="bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <span>{tag}</span>
                        <button type="button" onClick={() => setBestFor(bestFor.filter(t => t !== tag))} className="text-muted-foreground hover:text-foreground">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Integrations Tag Input */}
              <div className="space-y-2">
                <Label>Integrations Tags</Label>
                <div className="flex gap-2">
                  <Input value={integrationsInput} onChange={(e) => setIntegrationsInput(e.target.value)} placeholder="e.g. Zapier" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIntegration())} />
                  <Button type="button" variant="secondary" onClick={addIntegration}>Add</Button>
                </div>
                {integrations.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {integrations.map(tag => (
                      <span key={tag} className="bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <span>{tag}</span>
                        <button type="button" onClick={() => setIntegrations(integrations.filter(t => t !== tag))} className="text-muted-foreground hover:text-foreground">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Context Window */}
              <div className="space-y-2 pt-2 border-t border-border">
                <Label htmlFor="contextWindow">Context Window size</Label>
                <div className="flex items-center gap-4">
                  <Input id="contextWindow" value={contextWindow} onChange={(e) => setContextWindow(e.target.value)} placeholder="e.g. 200k tokens" disabled={isContextNA} />
                  <div className="flex items-center gap-1 text-xs shrink-0">
                    <input type="checkbox" id="contextNA" checked={isContextNA} onChange={(e) => { setIsContextNA(e.target.checked); if (e.target.checked) setContextWindow(""); }} className="rounded border-zinc-300 accent-primary" />
                    <Label htmlFor="contextNA" className="cursor-pointer">N/A</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slide 4: Verdict details */}
          <Card>
            <CardHeader><CardTitle>Verdict</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verdict">Official Verdict</Label>
                <Select value={verdict} onValueChange={(v: any) => setVerdict(v)}>
                  <SelectTrigger id="verdict"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="consider">Consider</SelectItem>
                    <SelectItem value="skip">Skip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verdictSum">Verdict Summary (Max 200 chars)</Label>
                <Textarea id="verdictSum" maxLength={200} value={verdictSummary} onChange={(e) => setVerdictSummary(e.target.value)} placeholder="Brief summary of the official verdict" />
                <div className="text-[10px] text-right text-muted-foreground">{verdictSummary.length}/200</div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </form>

    {showSuccess && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-[#FAFAF7] dark:bg-[#1A1A18] p-8 rounded-[6px] border border-border shadow-2xl flex flex-col items-center text-center max-w-sm space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30 text-green-600"
          >
            <Check className="w-8 h-8" strokeWidth={3} />
          </motion.div>
          <h3 className="font-display font-bold text-xl text-foreground">
            {isEdit ? "Tool Updated" : "Tool Added"}
          </h3>
          <p className="font-sans text-xs text-muted-foreground">
            {isEdit 
              ? "The modifications have been securely saved to the database."
              : "The new AI tool has been successfully created and published."}
          </p>
        </motion.div>
      </motion.div>
    )}
    </>
  );
}
