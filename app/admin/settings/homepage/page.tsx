"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { revalidatePaths } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Layers, Star, FileText, ArrowRight, Settings, Sliders, Menu, X, Plus, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SettingsItem {
  id: string;
  type: "review" | "post" | "tool";
  title: string;
  category: string;
  featured_order: number;
}

interface DropdownItem {
  id: string;
  name: string;
  category: string;
}

export default function HomepageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Comparison Settings
  const [aiToolsList, setAiToolsList] = useState<DropdownItem[]>([]);
  const [productAId, setProductAId] = useState("");
  const [productBId, setProductBId] = useState("");

  // Editor's Picks Settings
  const [picks, setPicks] = useState<SettingsItem[]>([]);
  
  // Search and Select all publishables to add to Picks
  const [allItems, setAllItems] = useState<SettingsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch published AI Tools for comparison dropdowns
      const { data: tools, error: toolsErr } = await supabase
        .from("ai_tools")
        .select("id, name, category")
        .eq("status", "published");
      if (toolsErr) throw toolsErr;
      setAiToolsList(tools.map(t => ({ id: t.id, name: t.name, category: t.category || "AI Tool" })));

      // 2. Fetch Comparison Config
      const { data: compConfig, error: compErr } = await supabase
        .from("settings")
        .select("*")
        .eq("key", "homepageComparison")
        .maybeSingle();

      if (compConfig && compConfig.value) {
        setProductAId(compConfig.value.productAId || "");
        setProductBId(compConfig.value.productBId || "");
      }

      // 3. Fetch Editor's Picks (reviews, posts, ai_tools where is_featured = true)
      const [
        { data: fReviews },
        { data: fPosts },
        { data: fTools }
      ] = await Promise.all([
        supabase.from("reviews").select("id, title, category_id, categories(name), featured_order").eq("is_featured", true).eq("status", "published"),
        supabase.from("posts").select("id, title, category_id, categories(name), featured_order").eq("is_featured", true).eq("status", "published"),
        supabase.from("ai_tools").select("id, name, category, featured_order").eq("is_featured", true).eq("status", "published")
      ]);

      const activePicks: SettingsItem[] = [
        ...(fReviews || []).map((r: any) => ({
          id: r.id,
          type: "review" as const,
          title: r.title,
          category: r.categories?.name || "Review",
          featured_order: r.featured_order || 99,
        })),
        ...(fPosts || []).map((p: any) => ({
          id: p.id,
          type: "post" as const,
          title: p.title,
          category: p.categories?.name || "Blog Post",
          featured_order: p.featured_order || 99,
        })),
        ...(fTools || []).map((t: any) => ({
          id: t.id,
          type: "tool" as const,
          title: t.name,
          category: t.category || "AI Tool",
          featured_order: t.featured_order || 99,
        }))
      ];

      // Sort picks by order
      activePicks.sort((a, b) => a.featured_order - b.featured_order);
      setPicks(activePicks.slice(0, 5));

      // 4. Fetch all available published items to add
      const [
        { data: allReviews },
        { data: allPosts },
        { data: allTools }
      ] = await Promise.all([
        supabase.from("reviews").select("id, title, category_id, categories(name)").eq("status", "published"),
        supabase.from("posts").select("id, title, category_id, categories(name)").eq("status", "published"),
        supabase.from("ai_tools").select("id, name, category").eq("status", "published")
      ]);

      const pool: SettingsItem[] = [
        ...(allReviews || []).map((r: any) => ({ id: r.id, type: "review" as const, title: r.title, category: r.categories?.name || "Review", featured_order: 99 })),
        ...(allPosts || []).map((p: any) => ({ id: p.id, type: "post" as const, title: p.title, category: p.categories?.name || "Blog Post", featured_order: 99 })),
        ...(allTools || []).map((t: any) => ({ id: t.id, type: "tool" as const, title: t.name, category: t.category || "AI Tool", featured_order: 99 }))
      ];
      setAllItems(pool);
    } catch (err: any) {
      console.error("Load settings error:", err);
      toast.error("Failed to load settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop picks reorder
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const itemsCopy = Array.from(picks);
    const [removed] = itemsCopy.splice(result.source.index, 1);
    itemsCopy.splice(result.destination.index, 0, removed);

    // Sync featured_order values
    const updated = itemsCopy.map((item, idx) => ({
      ...item,
      featured_order: idx + 1
    }));
    setPicks(updated);
  };

  // Add Item to Picks (Max 5)
  const handleAddItemToPicks = (item: SettingsItem) => {
    if (picks.length >= 5) {
      toast.warning("Maximum of 5 Editor's Picks allowed. Remove one to add this.");
      return;
    }
    if (picks.some(p => p.id === item.id)) {
      toast.info("This item is already added to Editor's Picks.");
      return;
    }
    const updated = [...picks, { ...item, featured_order: picks.length + 1 }];
    setPicks(updated);
    setShowAddMenu(false);
    setSearchQuery("");
    toast.success(`Added ${item.title} to Editor's Picks.`);
  };

  // Remove Item from Picks
  const handleRemoveItemFromPicks = (id: string) => {
    const filtered = picks.filter(p => p.id !== id);
    const updated = filtered.map((item, idx) => ({
      ...item,
      featured_order: idx + 1
    }));
    setPicks(updated);
    toast.info("Item removed from Editor's Picks.");
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Saving homepage configurations...");

    try {
      // 1. Save comparison config to settings table
      const comparisonVal = {
        productAId,
        productBId,
        updatedAt: new Date().toISOString()
      };

      const { error: settingsErr } = await supabase
        .from("settings")
        .upsert({
          key: "homepageComparison",
          value: comparisonVal,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      if (settingsErr) throw settingsErr;

      // 2. Clear current features first (set is_featured = false, featured_order = null)
      // Since we can't do transaction queries, let's reset all is_featured in reviews, posts, ai_tools
      await Promise.all([
        supabase.from("reviews").update({ is_featured: false, featured_order: null }).eq("is_featured", true),
        supabase.from("posts").update({ is_featured: false, featured_order: null }).eq("is_featured", true),
        supabase.from("ai_tools").update({ is_featured: false, featured_order: null }).eq("is_featured", true)
      ]);

      // 3. Set the new picks features in respective tables
      const promises = picks.map(pick => {
        let table = "reviews";
        if (pick.type === "post") table = "posts";
        if (pick.type === "tool") table = "ai_tools";

        return supabase
          .from(table)
          .update({ is_featured: true, featured_order: pick.featured_order })
          .eq("id", pick.id);
      });

      await Promise.all(promises);

      // Revalidate cache on-demand for home and compare pages
      await revalidatePaths(["/", "/compare"]);

      toast.success("Homepage configuration saved successfully!", { id: loadingToast });
      loadData();
    } catch (err: any) {
      console.error("Save settings error:", err);
      toast.error("Failed to save configuration: " + err.message, { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  // Filter Pool items based on search query
  const filteredPool = allItems.filter(item => {
    const isAlreadyPicked = picks.some(p => p.id === item.id);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadyPicked && matchesSearch;
  });

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-sans text-xs uppercase tracking-wider">Loading configurations...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Homepage Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure the Head-to-Head Comparison widgets and Editor's Picks grid ordering.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Config"}
        </Button>
      </div>

      {/* Hero Slider Link Promo Card */}
      <Card className="bg-primary/[0.02] border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <span>Hero Slides Manager</span>
          </CardTitle>
          <CardDescription>
            The Hero Slider contains up to 5 slide banners displaying custom editorial headlines and CTAs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/hero-slides" className="inline-flex items-center gap-1.5">
              <span>Open Hero Slides Manager</span>
              <ArrowRight size={13} />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Editor's Picks Reordering Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Editor's Picks</CardTitle>
                <CardDescription>Drag to set featured order (1-5).</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setShowAddMenu(!showAddMenu)} className="shrink-0">
                {showAddMenu ? <X size={12} className="mr-1" /> : <Plus size={12} className="mr-1" />}
                {showAddMenu ? "Close" : "Add Pick"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Search Dropdown Panel to Add New Picks */}
            {showAddMenu && (
              <div className="border border-primary/20 p-3 rounded-[6px] bg-primary/[0.01] space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-muted-foreground"><Search size={13} /></span>
                  <Input 
                    type="text" 
                    placeholder="Search articles, reviews, or tools..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="pl-8 text-xs h-8" 
                  />
                </div>
                
                <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-hide">
                  {filteredPool.length === 0 ? (
                    <div className="text-center py-4 text-[10px] text-muted-foreground">No matching items to add.</div>
                  ) : (
                    filteredPool.map(item => {
                      const Icon = item.type === "review" ? Star : (item.type === "post" ? FileText : Layers);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddItemToPicks(item)}
                          className="w-full text-left text-xs p-2 rounded hover:bg-secondary flex items-center justify-between border border-transparent hover:border-border transition-all"
                        >
                          <span className="font-medium truncate max-w-[200px] flex items-center gap-1.5">
                            <Icon size={12} className="text-muted-foreground shrink-0" />
                            <span>{item.title}</span>
                          </span>
                          <span className="text-[9px] uppercase font-mono text-muted-foreground px-1.5 py-0.5 bg-secondary rounded shrink-0">{item.category}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {picks.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs border border-dashed border-border rounded-md">
                No picks selected. Add up to 5 above.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="picks-list">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {picks.map((pick, idx) => {
                        const Icon = pick.type === "review" ? Star : (pick.type === "post" ? FileText : Layers);
                        return (
                          <Draggable key={pick.id} draggableId={pick.id} index={idx}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center justify-between border border-border p-3 rounded-[6px] bg-secondary/20 hover:bg-secondary/40 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab">
                                    <Menu size={15} />
                                  </div>
                                  <span className="font-mono text-xs font-semibold text-primary">{idx + 1}</span>
                                  <div className="min-w-0">
                                    <h5 className="text-xs font-semibold text-foreground truncate max-w-[180px] flex items-center gap-1.5">
                                      <Icon size={12} className="text-muted-foreground shrink-0" />
                                      <span>{pick.title}</span>
                                    </h5>
                                    <span className="text-[9px] text-muted-foreground capitalize font-sans">{pick.type} • {pick.category}</span>
                                  </div>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemFromPicks(pick.id)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-secondary"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>

        {/* Head-to-Head Comparison Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Featured Comparison</CardTitle>
            <CardDescription>Configure Product A and Product B for the Head-to-Head VS widget.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="prodA">Product A (Left side)</Label>
              <Select value={productAId} onValueChange={setProductAId}>
                <SelectTrigger id="prodA"><SelectValue placeholder="Select Product A" /></SelectTrigger>
                <SelectContent>
                  {aiToolsList.map(tool => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.name} ({tool.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prodB">Product B (Right side)</Label>
              <Select value={productBId} onValueChange={setProductBId}>
                <SelectTrigger id="prodB"><SelectValue placeholder="Select Product B" /></SelectTrigger>
                <SelectContent>
                  {aiToolsList.map(tool => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.name} ({tool.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {productAId === productBId && productAId !== "" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-[6px] text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>You selected the same tool for both items. Please select different tools.</span>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
