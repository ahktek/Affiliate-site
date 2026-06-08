"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AIToolForm from "@/components/admin/AIToolForm";
import { toast } from "sonner";

export default function EditAIToolPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [toolData, setToolData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchTool = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("ai_tools")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast.error("AI Tool not found");
          router.push("/admin/ai-tools");
          return;
        }

        setToolData(data);
      } catch (err: any) {
        console.error("Error fetching tool details:", err);
        toast.error("Failed to load AI Tool data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id, router]);

  if (loading) {
    return <div className="p-8 text-center text-zinc-500 font-sans text-xs uppercase tracking-wider">Loading tool details...</div>;
  }

  return <AIToolForm toolId={id} initialData={toolData} />;
}
