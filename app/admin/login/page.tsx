"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center blueprint-grid bg-background/50 px-4">
      <Card className="w-full max-w-md p-6 relative">
        <CardHeader className="text-left border-b border-dashed border-border/80 pb-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse shadow-led-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              SECURE ACCESS // PORTAL_GATEWAY
            </span>
          </div>
          <CardTitle className="text-2xl font-bold font-mono uppercase tracking-wider text-foreground">
            ADMIN LOGIN
          </CardTitle>
          <CardDescription className="font-sans text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Enter credentials to establish high-level session link. Direct console operations require validated signatures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-300/40 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">FAULT LOGGED:</div>
                  <div className="text-[10px] leading-snug">{error.toUpperCase()}</div>
                </div>
              </div>
            )}
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                IDENT_EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="USER@DOMAIN.SYS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                KEY_CODE
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "ESTABLISHING SESSION..." : "ESTABLISH SESSION"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Small floating technical return button */}
      <Link href="/" className="absolute bottom-6 font-mono text-[10px] text-muted-foreground uppercase hover:text-foreground tracking-wider transition-colors">
        « DISCONNECT_SESSION_RETURN_HOME
      </Link>
    </div>
  );
}
