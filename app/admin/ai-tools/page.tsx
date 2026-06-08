"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Layers, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface AITool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: string;
  status: "draft" | "scheduled" | "published" | "archived";
  overall_score: number;
  pricing_model: string;
  starting_price: string;
  scheduled_at?: string;
  created_at: string;
}

export default function AIToolsManager() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error: any) {
      console.error("Error fetching AI tools:", error);
      toast.error("Failed to load AI Tools: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const { error } = await supabase.from("ai_tools").delete().eq("id", id);
        if (error) throw error;
        setTools(tools.filter(t => t.id !== id));
        toast.success(`Deleted ${name} successfully.`);
      } catch (error: any) {
        console.error("Error deleting AI tool:", error);
        toast.error("Failed to delete tool: " + error.message);
      }
    }
  };

  const renderStatusBadge = (tool: AITool) => {
    const status = tool.status;
    if (status === "published") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Published
        </span>
      );
    }
    if (status === "scheduled") {
      const dateStr = tool.scheduled_at 
        ? new Date(tool.scheduled_at).toLocaleDateString() 
        : "";
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" title={`Scheduled for ${tool.scheduled_at}`}>
          Scheduled ({dateStr})
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
        <div>
          <h1 className="text-3xl font-bold">AI Tools Directory Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage comparisons, ratings, specifications, and affiliate URLs for the AI Tools engine.</p>
        </div>
        <Button asChild>
          <Link href="/admin/ai-tools/new">
            <Plus className="w-4 h-4 mr-2" /> Add AI Tool
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Pricing Model</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">Loading AI Tools...</TableCell>
              </TableRow>
            ) : tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-zinc-500">No AI Tools found. Create one to get started.</TableCell>
              </TableRow>
            ) : (
              tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Layers size={14} className="text-muted-foreground" />
                    <span>{tool.name}</span>
                  </TableCell>
                  <TableCell>{tool.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-mono font-semibold text-primary">
                      <Star size={12} className="fill-current" />
                      <span>{Number(tool.overall_score).toFixed(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize font-mono text-xs">
                    {tool.pricing_model} ({tool.starting_price || "$0"})
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(tool)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/ai-tools/${tool.id}/edit`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(tool.id, tool.name)}>
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
