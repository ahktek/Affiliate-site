"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { revalidatePaths } from "@/app/actions/revalidate";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      
      const mapped = (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        icon: cat.icon || "",
        parentId: cat.parent_id || null,
        createdAt: new Date(cat.created_at || Date.now()).getTime(),
      })) as Category[];

      setCategories(mapped);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
    if (!newSlug || newSlug === generateSlug(newName)) {
      setNewSlug(generateSlug(e.target.value));
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim() || saving) return;
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: newName,
          slug: newSlug,
          description: newDescription,
        })
        .select()
        .single();

      if (error) throw error;

      await revalidatePaths(["/", "/reviews", "/blog", "/ai-tools"]);

      if (data) {
        setCategories([
          ...categories,
          {
            id: data.id,
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            icon: data.icon || "",
            parentId: data.parent_id || null,
            createdAt: new Date(data.created_at).getTime(),
          },
        ]);
      }

      // Reset form
      setNewName("");
      setNewSlug("");
      setNewDescription("");
      setIsNewOpen(false);
    } catch (error: any) {
      console.error("Error creating category:", error);
      alert("Failed to create category: " + (error.message || error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this category? This will affect posts/reviews in this category.")) {
      try {
        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (error) throw error;
        await revalidatePaths(["/", "/reviews", "/blog", "/ai-tools"]);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        
        <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateCategory}>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
                <DialogDescription>
                  Create a new category for reviews and posts.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newName}
                    onChange={handleNameChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="slug" className="text-right">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24 text-zinc-500">Loading...</TableCell></TableRow>
            ) : categories.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center h-24 text-zinc-500">No categories found.</TableCell></TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{cat.slug}</TableCell>
                  <TableCell className="text-sm text-zinc-500 max-w-[300px] truncate">{cat.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(cat.id)}>
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
