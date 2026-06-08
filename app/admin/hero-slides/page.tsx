"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Eye, 
  Menu,
  Check,
  AlertTriangle,
  Monitor,
  Smartphone
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Slide {
  id: string;
  slide_order: number;
  is_active: boolean;
  headline: string;
  subline: string;
  cta_primary_text: string;
  cta_primary_url: string;
  cta_secondary_text: string;
  cta_secondary_url: string;
  image_url: string;
  image_alt: string;
  overlay_opacity: number;
  overlay_color: string;
}

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [savingSlide, setSavingSlide] = useState(false);

  // Fetch all slides on mount
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async (selectId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("slide_order", { ascending: true });

      if (error) throw error;
      
      const items = data || [];
      setSlides(items);

      if (items.length > 0) {
        if (selectId) {
          const matched = items.find(s => s.id === selectId);
          setSelectedSlide(matched || items[0]);
        } else {
          setSelectedSlide(items[0]);
        }
      } else {
        setSelectedSlide(null);
      }
    } catch (err: any) {
      console.error("Error fetching slides:", err);
      toast.error("Failed to load slides: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Sort handler
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const reordered = Array.from(slides);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    
    // Update orders sequentially
    const updated = reordered.map((slide, idx) => ({
      ...slide,
      slide_order: idx + 1
    }));
    
    setSlides(updated);

    const loadingToast = toast.loading("Saving slide order...");
    try {
      const promises = updated.map(slide => 
        supabase
          .from("hero_slides")
          .update({ slide_order: slide.slide_order })
          .eq("id", slide.id)
      );
      await Promise.all(promises);
      toast.success("Slides order updated successfully!", { id: loadingToast });
    } catch (err: any) {
      console.error("Order save error:", err);
      toast.error("Failed to save reordered list: " + err.message, { id: loadingToast });
    }
  };

  // Toggle active/inactive (Enforce minimum 1 active slide at all times)
  const handleToggleActive = async (slide: Slide) => {
    const activeCount = slides.filter(s => s.is_active).length;
    
    if (slide.is_active && activeCount <= 1) {
      toast.warning("Minimum of 1 active slide must be kept live at all times.");
      return;
    }

    const nextActive = !slide.is_active;
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({ is_active: nextActive })
        .eq("id", slide.id);

      if (error) throw error;
      
      // Update local state
      setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: nextActive } : s));
      if (selectedSlide && selectedSlide.id === slide.id) {
        setSelectedSlide({ ...selectedSlide, is_active: nextActive });
      }
      toast.success(`Slide is now ${nextActive ? "Active" : "Inactive"}`);
    } catch (err: any) {
      console.error("Toggle active error:", err);
      toast.error("Failed to update status: " + err.message);
    }
  };

  // Add Slide (Limit max 5)
  const handleAddSlide = async () => {
    if (slides.length >= 5) {
      toast.error("Maximum of 5 slides allowed.");
      return;
    }

    const nextOrder = slides.length + 1;
    const newSlidePayload = {
      slide_order: nextOrder,
      is_active: true,
      headline: "New AI Revolution Slide",
      subline: "Edit this subtitle text to write custom insights",
      cta_primary_text: "Explore Tools",
      cta_primary_url: "/ai-tools",
      cta_secondary_text: "",
      cta_secondary_url: "",
      image_url: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=1200",
      image_alt: "Editorial photo desk setup",
      overlay_opacity: 0.40,
      overlay_color: "#000000"
    };

    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .insert(newSlidePayload)
        .select()
        .single();

      if (error) throw error;
      toast.success("New slide created! Edit details in the panel.");
      fetchSlides(data.id);
    } catch (err: any) {
      console.error("Create slide error:", err);
      toast.error("Failed to create slide: " + err.message);
    }
  };

  // Delete Slide
  const handleDeleteSlide = async (slideId: string) => {
    const slideToDelete = slides.find(s => s.id === slideId);
    if (!slideToDelete) return;

    if (slideToDelete.is_active && slides.filter(s => s.is_active).length <= 1) {
      toast.warning("Cannot delete the only active slide. Activate another slide first.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        const { error } = await supabase.from("hero_slides").delete().eq("id", slideId);
        if (error) throw error;
        toast.success("Slide deleted successfully.");
        fetchSlides();
      } catch (err: any) {
        console.error("Delete slide error:", err);
        toast.error("Failed to delete slide: " + err.message);
      }
    }
  };

  // Update selected slide fields
  const handleSaveSlideChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide) return;

    setSavingSlide(true);
    const loadingToast = toast.loading("Saving slide updates...");
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({
          headline: selectedSlide.headline,
          subline: selectedSlide.subline,
          cta_primary_text: selectedSlide.cta_primary_text,
          cta_primary_url: selectedSlide.cta_primary_url,
          cta_secondary_text: selectedSlide.cta_secondary_text,
          cta_secondary_url: selectedSlide.cta_secondary_url,
          image_url: selectedSlide.image_url,
          image_alt: selectedSlide.image_alt,
          overlay_opacity: Number(selectedSlide.overlay_opacity),
          overlay_color: selectedSlide.overlay_color,
        })
        .eq("id", selectedSlide.id);

      if (error) throw error;
      toast.success("Slide changes saved successfully!", { id: loadingToast });
      fetchSlides(selectedSlide.id);
    } catch (err: any) {
      console.error("Slide save error:", err);
      toast.error("Failed to save slide updates: " + err.message, { id: loadingToast });
    } finally {
      setSavingSlide(false);
    }
  };

  // Image Upload handler for slide background image
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedSlide) return;

    const file = files[0];
    const loadingToast = toast.loading(`Uploading background image ${file.name}...`);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero_slide_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      setSelectedSlide({ ...selectedSlide, image_url: publicUrl });
      toast.success("Background image uploaded successfully!", { id: loadingToast });
    } catch (err: any) {
      console.error("Storage upload error:", err);
      toast.error("Failed to upload slide image: " + err.message, { id: loadingToast });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Hero Slides Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Reorder, activate/deactivate, and customize the slides rendered in the home hero section.</p>
        </div>
        <Button 
          onClick={handleAddSlide} 
          disabled={slides.length >= 5 || loading}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Slide ({slides.length}/5)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Reorder List (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Slides List (Drag to Reorder)</CardTitle></CardHeader>
            <CardContent className="pt-2">
              {loading && slides.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-sans text-xs">Loading slides...</div>
              ) : slides.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-sans text-xs border border-dashed border-border rounded-md">
                  No slides created yet. Add one above.
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="slides-list">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {slides.map((slide, idx) => (
                          <Draggable key={slide.id} draggableId={slide.id} index={idx}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-center gap-3 bg-secondary/40 border p-3 rounded-[6px] transition-all hover:bg-secondary/60 ${
                                  selectedSlide?.id === slide.id ? "border-primary" : "border-border"
                                }`}
                              >
                                {/* Drag Handle */}
                                <div {...provided.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab">
                                  <Menu size={16} />
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-12 h-8 rounded-[4px] overflow-hidden bg-zinc-950 border border-border">
                                  <Image src={slide.image_url} alt="" fill className="object-cover" />
                                </div>

                                {/* Headline & Status */}
                                <div className="flex-1 min-w-0" onClick={() => setSelectedSlide(slide)}>
                                  <h4 className="font-sans text-xs font-semibold text-foreground truncate cursor-pointer">
                                    {slide.headline}
                                  </h4>
                                  <span className="font-sans text-[10px] text-muted-foreground">Order: {slide.slide_order}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggleActive(slide)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border transition-colors ${
                                      slide.is_active
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                    }`}
                                  >
                                    {slide.is_active ? "Active" : "Muted"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-secondary"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Settings + Live Preview Mockups (lg:col-span-7) */}
        {selectedSlide ? (
          <div className="lg:col-span-7 space-y-8">
            <Card>
              <CardHeader><CardTitle className="text-lg">Edit Slide Properties</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSlideChanges} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline (Max 60 chars)</Label>
                    <Input 
                      id="headline" 
                      maxLength={60} 
                      value={selectedSlide.headline} 
                      onChange={(e) => setSelectedSlide({ ...selectedSlide, headline: e.target.value })} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subline">Subline (Max 120 chars)</Label>
                    <Textarea 
                      id="subline" 
                      maxLength={120} 
                      value={selectedSlide.subline} 
                      onChange={(e) => setSelectedSlide({ ...selectedSlide, subline: e.target.value })} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ctaPText">Primary CTA Text</Label>
                      <Input id="ctaPText" value={selectedSlide.cta_primary_text} onChange={(e) => setSelectedSlide({ ...selectedSlide, cta_primary_text: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaPUrl">Primary CTA URL</Label>
                      <Input id="ctaPUrl" value={selectedSlide.cta_primary_url} onChange={(e) => setSelectedSlide({ ...selectedSlide, cta_primary_url: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ctaSText">Secondary CTA Text</Label>
                      <Input id="ctaSText" value={selectedSlide.cta_secondary_text} onChange={(e) => setSelectedSlide({ ...selectedSlide, cta_secondary_text: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ctaSUrl">Secondary CTA URL</Label>
                      <Input id="ctaSUrl" value={selectedSlide.cta_secondary_url} onChange={(e) => setSelectedSlide({ ...selectedSlide, cta_secondary_url: e.target.value })} />
                    </div>
                  </div>

                  {/* Upload slide bg image */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label>Background Image URL</Label>
                    <div className="flex gap-2">
                      <Input value={selectedSlide.image_url} onChange={(e) => setSelectedSlide({ ...selectedSlide, image_url: e.target.value })} placeholder="https://..." />
                      <div className="relative">
                        <Input type="file" accept="image/*" onChange={handleSlideImageUpload} className="sr-only" id="slideBgUpload" />
                        <Label htmlFor="slideBgUpload" className="flex items-center gap-1 border border-border px-3 py-2 rounded-[6px] text-xs font-semibold cursor-pointer hover:bg-secondary">
                          <Upload size={13} /> Upload
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Opacity & Color sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="space-y-2">
                      <Label htmlFor="overlayColor">Overlay Color (Hex)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="overlayColor" 
                          type="color" 
                          value={selectedSlide.overlay_color} 
                          onChange={(e) => setSelectedSlide({ ...selectedSlide, overlay_color: e.target.value })} 
                          className="w-12 h-10 p-0.5 border border-border" 
                        />
                        <Input 
                          value={selectedSlide.overlay_color} 
                          onChange={(e) => setSelectedSlide({ ...selectedSlide, overlay_color: e.target.value })} 
                          placeholder="#000000" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex justify-between">
                        <span>Overlay Opacity</span>
                        <span className="font-mono text-xs">{(selectedSlide.overlay_opacity * 100).toFixed(0)}%</span>
                      </Label>
                      <input 
                        type="range" 
                        min={0.0} 
                        max={0.9} 
                        step={0.05} 
                        value={selectedSlide.overlay_opacity} 
                        onChange={(e) => setSelectedSlide({ ...selectedSlide, overlay_opacity: parseFloat(e.target.value) })} 
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={savingSlide}>
                      {savingSlide ? "Saving slide..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* LIVE PREVIEW PANE MOCKUPS (600px desktop + 380px mobile) */}
            <div className="space-y-6">
              <h3 className="font-display font-semibold text-lg border-b border-border pb-2">Live Preview Drawer</h3>
              
              {/* Desktop Mockup (600px width preview) */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-sans font-medium">
                  <Monitor size={13} />
                  <span>Desktop Preview (600px simulation)</span>
                </span>
                
                <div className="relative w-full h-[250px] bg-zinc-950 overflow-hidden border border-border rounded-[6px]">
                  {/* Background Image */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image src={selectedSlide.image_url} alt="" fill className="object-cover" unoptimized />
                  </div>
                  
                  {/* Overlay Color and Opacity */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: selectedSlide.overlay_color,
                      opacity: selectedSlide.overlay_opacity
                    }}
                  />

                  {/* Content Box */}
                  <div className="absolute inset-y-0 left-0 w-[55%] flex items-center p-6 pl-10">
                    <div className="bg-[#FAFAF7]/95 dark:bg-[#141412]/95 p-4 rounded-[6px] border border-border space-y-3 w-full shadow-lg">
                      <span className="font-sans text-[7px] uppercase tracking-wider font-semibold text-primary">FEATURED ANALYSIS</span>
                      <h4 className="font-display font-bold text-xs text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{selectedSlide.headline}</h4>
                      <p className="font-body text-[8px] text-muted-foreground leading-relaxed line-clamp-2">{selectedSlide.subline}</p>
                      <div className="flex gap-2 pt-1">
                        <span className="bg-primary text-primary-foreground text-[7px] px-2 py-1 rounded-[4px] font-semibold">{selectedSlide.cta_primary_text || "Primary"}</span>
                        {selectedSlide.cta_secondary_text && (
                          <span className="border border-border text-[7px] px-2 py-1 rounded-[4px] font-semibold dark:text-white">{selectedSlide.cta_secondary_text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Mockup (380px simulation) */}
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-sans font-medium">
                  <Smartphone size={13} />
                  <span>Mobile Preview (380px simulation)</span>
                </span>
                
                <div className="relative w-[320px] mx-auto h-[220px] bg-zinc-950 overflow-hidden border border-border rounded-[6px]">
                  {/* Background Image */}
                  <div className="absolute inset-0 w-full h-full">
                    <Image src={selectedSlide.image_url} alt="" fill className="object-cover" unoptimized />
                  </div>
                  
                  {/* Overlay Color and Opacity */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: selectedSlide.overlay_color,
                      // For mobile background layout, opacity is increased a bit if opacity is low to keep text legible
                      opacity: Math.max(selectedSlide.overlay_opacity, 0.5)
                    }}
                  />

                  {/* Content Container (Full Width on mobile preview) */}
                  <div className="absolute inset-0 flex items-center p-4">
                    <div className="bg-[#FAFAF7]/92 dark:bg-[#141412]/92 p-3.5 rounded-[6px] border border-border space-y-2.5 w-full shadow-lg">
                      <span className="font-sans text-[7px] uppercase tracking-wider font-semibold text-primary">FEATURED ANALYSIS</span>
                      <h4 className="font-display font-bold text-[10px] text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">{selectedSlide.headline}</h4>
                      <p className="font-body text-[8px] text-muted-foreground leading-relaxed line-clamp-2">{selectedSlide.subline}</p>
                      <div className="flex gap-1.5 pt-0.5">
                        <span className="bg-primary text-primary-foreground text-[6px] px-2 py-0.5 rounded-[4px] font-semibold">{selectedSlide.cta_primary_text || "Primary"}</span>
                        {selectedSlide.cta_secondary_text && (
                          <span className="border border-border text-[6px] px-2 py-0.5 rounded-[4px] font-semibold dark:text-white">{selectedSlide.cta_secondary_text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 py-20 text-center text-muted-foreground border border-dashed border-border bg-secondary/10 rounded-[6px]">
            No slide selected. Click on a slide in the list to configure it.
          </div>
        )}

      </div>
    </div>
  );
}
