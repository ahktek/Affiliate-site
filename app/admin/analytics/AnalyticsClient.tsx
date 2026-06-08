"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Download, 
  Calendar, 
  Layers, 
  Star, 
  FileText, 
  Users, 
  MousePointer, 
  FileCheck2, 
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function AnalyticsClient() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [data, setData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // Pagination for Top Content table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting for Top Content table
  const [sortField, setSortField] = useState("views");
  const [sortAscending, setSortAscending] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics(days, false);
  }, [days]);

  const fetchAnalytics = async (selectedDays: number, showRefreshToast = false) => {
    if (showRefreshToast) setUpdating(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/admin/analytics?days=${selectedDays}`);
      if (!res.ok) throw new Error("API return code error");
      const json = await res.json();
      
      if (json.success) {
        setData(json);
        if (showRefreshToast) toast.success("Analytics data refreshed.");
      } else {
        throw new Error(json.error || "Analytics load failed");
      }
    } catch (err: any) {
      console.error("Fetch analytics error:", err);
      toast.error("Failed to load statistics: " + err.message);
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  // Client-side table sort logic
  const sortedContentList = useMemo(() => {
    if (!data?.topContentList) return [];
    return [...data.topContentList].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "lastUpdated") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (typeof valA === "string") {
        return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortAscending ? valA - valB : valB - valA;
    });
  }, [data?.topContentList, sortField, sortAscending]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(false);
    }
  };

  // Pagination slice
  const paginatedContent = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return sortedContentList.slice(startIdx, startIdx + itemsPerPage);
  }, [sortedContentList, currentPage]);

  const totalPages = Math.ceil(sortedContentList.length / itemsPerPage);

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    if (!data) return;
    
    // Assemble daily views CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Date/Title,Value/Views,Affiliate Clicks\n";
    
    // Add pageviews
    data.dailyViews.forEach((v: any) => {
      csvContent += `Daily Pageview,${v.date},${v.Views},${v.AIToolsViews}\n`;
    });
    
    // Add top content
    data.topContentList.forEach((c: any) => {
      const cleanTitle = c.title.replace(/"/g, '""');
      csvContent += `Content,"${cleanTitle}",${c.views},${c.clicks}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chronicle_analytics_${days}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  // Direct edit redirect click handler
  const handleRowClick = (item: any) => {
    let route = `/admin/reviews/${item.id}/edit`;
    if (item.type === "Article") route = `/admin/posts/${item.id}/edit`;
    if (item.type === "AI Tool") route = `/admin/ai-tools/${item.id}/edit`;
    router.push(route);
  };

  if (!mounted) return null;

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center font-sans text-xs uppercase tracking-wider text-muted-foreground">
        Loading analytics charts...
      </div>
    );
  }

  const stats = data?.stats || {
    pageViews: { value: 0, diff: 0 },
    reviewsCount: 0,
    affiliateClicks: { value: 0, diff: 0 },
    subscribers: { value: 0, diff: 0 }
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Updating overlay skeleton loader */}
      {updating && (
        <div className="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 z-50 flex items-center justify-center">
          <div className="bg-card border border-border p-4 rounded-[6px] shadow-lg flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span className="font-sans text-xs font-semibold">Updating statistics...</span>
          </div>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Analytics & Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit page views, matchup events, subscribers, and affiliate conversion growth graphs.</p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          {/* Refresh button */}
          <Button variant="outline" size="icon" onClick={() => fetchAnalytics(days, true)} title="Refresh data">
            <RefreshCw className="w-4 h-4" />
          </Button>

          {/* Date range filter */}
          <div className="flex items-center gap-1.5 border border-border bg-card rounded-[6px] px-2 py-1.5 text-xs font-sans">
            <Calendar size={13} className="text-muted-foreground" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-transparent border-none focus:outline-none cursor-pointer pr-1 font-medium"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          {/* Export CSV button */}
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="inline-flex items-center gap-1.5 text-xs">
            <Download size={13} />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* SECTION 1: Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Page Views */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Page Views</CardTitle>
            <Star className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.pageViews.value.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {stats.pageViews.diff >= 0 ? (
                <span className="text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> +{stats.pageViews.diff.toFixed(1)}%</span>
              ) : (
                <span className="text-red-600 flex items-center gap-0.5"><TrendingDown size={12} /> {stats.pageViews.diff.toFixed(1)}%</span>
              )}
              <span className="text-muted-foreground font-sans">vs prev {days}d</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Reviews published */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reviews & Posts</CardTitle>
            <FileCheck2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.reviewsCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-sans">Published content total in database</p>
          </CardContent>
        </Card>

        {/* Card 3: Affiliate clicks */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Affiliate Clicks</CardTitle>
            <MousePointer className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.affiliateClicks.value}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {stats.affiliateClicks.diff >= 0 ? (
                <span className="text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> +{stats.affiliateClicks.diff.toFixed(1)}%</span>
              ) : (
                <span className="text-red-600 flex items-center gap-0.5"><TrendingDown size={12} /> {stats.affiliateClicks.diff.toFixed(1)}%</span>
              )}
              <span className="text-muted-foreground font-sans">vs prev {days}d</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Subscribers */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Newsletter Subs</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.subscribers.value}</div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {stats.subscribers.diff >= 0 ? (
                <span className="text-green-600 flex items-center gap-0.5"><TrendingUp size={12} /> +{stats.subscribers.diff.toFixed(1)}%</span>
              ) : (
                <span className="text-red-600 flex items-center gap-0.5"><TrendingDown size={12} /> {stats.subscribers.diff.toFixed(1)}%</span>
              )}
              <span className="text-muted-foreground font-sans">vs prev {days}d</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: Page views over time line chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Page Views Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.dailyViews || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Views" name="All Content views" stroke="#18181b" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="AIToolsViews" name="AI Tools views" stroke="#C8502A" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Content list table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Content</CardTitle>
          <CardDescription>Click any row to open that item's edit screen in a new tab.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/40 font-sans">
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("title")}>
                    Content Title
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("type")}>
                    Type
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("views")}>
                    Page Views
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("clicks")}>
                    Affiliate Clicks
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("avgScore")}>
                    Score Ring
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-secondary/60 transition-colors" onClick={() => handleSort("lastUpdated")}>
                    Last Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContent.map((item, idx) => {
                  let badgeClass = "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
                  if (item.type === "Review") badgeClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
                  if (item.type === "AI Tool") badgeClass = "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400";
                  
                  return (
                    <TableRow 
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer hover:bg-secondary/20 transition-all font-sans text-xs group"
                    >
                      <TableCell className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wide border-transparent border uppercase ${badgeClass}`}>
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">{item.views.toLocaleString()}</TableCell>
                      <TableCell className="font-mono">{item.clicks.toLocaleString()}</TableCell>
                      <TableCell className="font-mono font-bold text-primary">
                        {item.avgScore > 0 ? `${Number(item.avgScore).toFixed(1)}/10` : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Table pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-6">
              <span className="text-xs text-muted-foreground font-sans">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 4 & 5: Matchup & Affiliate click counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Matchups compared */}
        <Card>
          <CardHeader><CardTitle className="text-lg">AI Tool Comparison Usage</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {data?.compareChartData?.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground font-sans">No comparison data logs recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.compareChartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="Comparisons" fill="#C8502A" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Clicks performance */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Affiliate Click-Throughs</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {data?.affiliateChartData?.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground font-sans">No affiliate clicks recorded.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={data?.affiliateChartData || []} 
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                    <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="Clicks" fill="#18181b" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 6 & 7: Subscriber growth & content breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Subscriber Growth */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">Subscriber Cumulative Growth</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px] w-full font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.growthData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Subscribers" stroke="#C8502A" fill="#C8502A" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Content Status Breakdown */}
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Content Status Breakdown</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-between">
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.statusBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data?.statusBreakdown?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Pie inner text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-mono text-2xl font-bold text-foreground">
                  {data?.statusBreakdown?.reduce((sum: number, entry: any) => sum + entry.value, 0) || 0}
                </span>
                <span className="font-sans text-[10px] text-muted-foreground uppercase font-semibold">Total Docs</span>
              </div>
            </div>

            {/* Pie legend bottom custom */}
            <div className="w-full grid grid-cols-2 gap-2 text-left pt-2 font-sans text-xs">
              {data?.statusBreakdown?.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: entry.color }} />
                  <span className="font-medium text-muted-foreground">{entry.name}</span>
                  <span className="font-mono font-bold text-foreground ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  );
}
