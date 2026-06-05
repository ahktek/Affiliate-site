import * as React from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminContext, bootstrapFirstAdmin } from "@/lib/admin.functions";
import { AdminSidebar, AdminMobileBar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Stackpilot" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = React.useState(false);
  const [hasSession, setHasSession] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(!!data.session);
      setSessionReady(true);
      if (!data.session) {
        navigate({ to: "/login", search: { redirect: "/admin" } });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
      if (!session) navigate({ to: "/login", search: { redirect: "/admin" } });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const getCtx = useServerFn(getMyAdminContext);
  const ctx = useQuery({
    queryKey: ["admin-context"],
    queryFn: () => getCtx(),
    enabled: sessionReady && hasSession,
  });

  if (!sessionReady || !hasSession) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (ctx.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading admin…</div>;
  }
  if (ctx.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-sm">
        <div className="text-destructive">Failed to load admin: {String((ctx.error as Error).message)}</div>
      </div>
    );
  }
  if (!ctx.data?.hasAccess) {
    return <NoAccessScreen email={ctx.data?.email ?? null} />;
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <AdminSidebar email={ctx.data?.email} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminMobileBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NoAccessScreen({ email }: { email: string | null }) {
  const qc = useQueryClient();
  const bootstrap = useServerFn(bootstrapFirstAdmin);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  async function claim() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await bootstrap();
      if (res.ok) {
        await qc.invalidateQueries({ queryKey: ["admin-context"] });
      } else {
        setMsg("An administrator already exists. Ask them to grant you access.");
      }
    } catch (e: any) {
      setMsg(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border bg-card p-8">
        <h1 className="text-xl font-semibold">No admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <strong>{email}</strong>, but you don't have the admin or editor role yet.
        </p>
        <div className="mt-6 space-y-2">
          <Button onClick={claim} disabled={loading} className="w-full">
            {loading ? "Claiming…" : "Claim admin (first user only)"}
          </Button>
          {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          <button
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/login"))}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
