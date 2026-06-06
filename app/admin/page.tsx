"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center font-sans text-xs uppercase tracking-wider text-muted-foreground bg-white">
      Redirecting to dashboard...
    </div>
  );
}
