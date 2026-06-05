import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight client-side auth hook. Subscribes to Supabase auth state and
 * exposes the current session + user. Use TanStack Router `_authenticated`
 * layout guards for route protection; this hook is for UI affordances
 * (header avatar, sign-in/out buttons).
 */
export function useAuth() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null as User | null,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
}
