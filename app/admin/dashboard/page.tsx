"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, Users, Eye, Cpu, Database, Activity, Radio } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    reviews: 0,
    subscribers: 0,
    views: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [postsRes, reviewsRes, subsRes] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("reviews").select("*", { count: "exact", head: true }),
          supabase.from("subscribers").select("*", { count: "exact", head: true }),
        ]);
        
        setStats({
          posts: postsRes.count || 0,
          reviews: reviewsRes.count || 0,
          subscribers: subsRes.count || 0,
          views: 1240
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { title: "TOTAL_POSTS // CHN_01", value: stats.posts, icon: FileText, color: "text-primary", label: "LOG_LOGGED" },
    { title: "TOTAL_REVIEWS // CHN_02", value: stats.reviews, icon: Star, color: "text-amber-500", label: "REV_VERIFIED" },
    { title: "TOTAL_SUBSCRIBERS // CHN_03", value: stats.subscribers, icon: Users, color: "text-emerald-500", label: "USERS_CONN" },
    { title: "PAGE_VIEWS_30D // CHN_04", value: stats.views, icon: Eye, color: "text-sky-500", label: "REQ_LOGGED" },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="border-b border-dashed border-border/80 pb-6">
        <span className="tape-label text-[10px] font-mono text-neutral-800 px-3 py-1 uppercase tracking-widest inline-block mb-3 shadow-sm">
          CONTROL SECTOR // MASTER_MONITOR
        </span>
        <h1 className="text-2xl font-bold font-mono uppercase tracking-wider text-foreground">
          SYSTEM DASHBOARD
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Diagnostics readout terminal for system archives, product tables, and user channel connections.
        </p>
      </div>
      
      {/* Glow meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="flex flex-col relative overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-dashed border-border/50 bg-muted/10">
                <CardTitle className="text-[10px] font-mono tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                {/* 7-Segment style vacuum tube readout screen */}
                <div className="bg-slate-950 p-4 border border-black/80 rounded-lg shadow-[inset_2px_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                  <div className="absolute inset-0 crt-screen pointer-events-none opacity-20" />
                  
                  {/* Glowing Counter */}
                  <div className="font-mono font-bold text-3xl tracking-widest text-primary filter drop-shadow-[0_0_6px_rgba(255,71,87,0.7)]">
                    {String(stat.value).padStart(4, "0")}
                  </div>
                  
                  {/* Monospace channel label */}
                  <span className="font-mono text-[9px] text-neutral-500 uppercase self-end">
                    {stat.label}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-7 flex flex-col p-6">
          <CardHeader className="p-0 pb-4 border-b border-dashed border-border/60">
            <span className="font-mono text-[9px] text-muted-foreground tracking-widest block mb-1">
              LOG_BUFFER // SEC_0
            </span>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">
              RECENT_ACTIVITY_QUEUE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 flex-1 flex flex-col justify-center items-center py-12 bg-muted/15 rounded-lg border border-border/30 shadow-recessed mt-4 min-h-[150px]">
            <Radio className="w-8 h-8 text-muted-foreground/30 mb-2 animate-pulse" />
            <p className="text-xs font-mono text-muted-foreground">WAITING FOR BUS SIGNALS... QUEUE EMPTY</p>
          </CardContent>
        </Card>
        
        {/* System Hardware Status */}
        <Card className="lg:col-span-5 flex flex-col p-6">
          <CardHeader className="p-0 pb-4 border-b border-dashed border-border/60">
            <span className="font-mono text-[9px] text-muted-foreground tracking-widest block mb-1">
              DIAG_HARDWARE // TEST_2
            </span>
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-foreground">
              HARDWARE_CHASSIS_STATUS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 space-y-4">
            {/* Database Switch indicator */}
            <div className="flex justify-between items-center bg-muted/30 border border-border/40 p-3 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase text-muted-foreground tracking-wide">DATABASE // CONN_0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-500">ONLINE</span>
              </div>
            </div>

            {/* Auth Switch indicator */}
            <div className="flex justify-between items-center bg-muted/30 border border-border/40 p-3 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase text-muted-foreground tracking-wide">AUTH_LINK // SEC_LNK</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="font-mono text-xs font-bold text-emerald-500">CONNECTED</span>
              </div>
            </div>

            {/* CPU Signal indicator */}
            <div className="flex justify-between items-center bg-muted/30 border border-border/40 p-3 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase text-muted-foreground tracking-wide">POWER_LOAD // BUS_LOAD</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-led-pulse animate-pulse" />
                <span className="font-mono text-xs font-bold text-primary">PWR_ACTIVE</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
