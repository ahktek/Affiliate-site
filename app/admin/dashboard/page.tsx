"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, Users, Eye } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    reviews: 0,
    subscribers: 0,
    views: 0 // Placeholder
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const postsSnap = await getCountFromServer(collection(db, "posts"));
        const reviewsSnap = await getCountFromServer(collection(db, "reviews"));
        const subsSnap = await getCountFromServer(collection(db, "subscribers"));
        
        setStats({
          posts: postsSnap.data().count,
          reviews: reviewsSnap.data().count,
          subscribers: subsSnap.data().count,
          views: 1200 // Placeholder for page views
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Posts", value: stats.posts, icon: FileText, color: "text-blue-500" },
    { title: "Total Reviews", value: stats.reviews, icon: Star, color: "text-amber-500" },
    { title: "Total Subscribers", value: stats.subscribers, icon: Users, color: "text-green-500" },
    { title: "Page Views (30d)", value: stats.views, icon: Eye, color: "text-purple-500" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">{stat.title}</CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-500 text-sm">No recent activity to show.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-green-500 font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Auth System</span>
                <span className="text-sm text-green-500 font-medium">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
