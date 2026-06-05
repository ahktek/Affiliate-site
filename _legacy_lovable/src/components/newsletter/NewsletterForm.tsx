import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribe } from "@/lib/subscribers.functions";

export function NewsletterForm({ source = "footer", compact = false }: { source?: string; compact?: boolean }) {
  const subscribeFn = useServerFn(subscribe);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (website) return; // bot
    setState("loading");
    try {
      const res = await subscribeFn({ data: { email, source } });
      if (res.ok) {
        setState("ok");
        setMsg("You're in. Check your inbox soon.");
        setEmail("");
      } else {
        setState("error");
        setMsg(res.error || "Something went wrong");
      }
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex gap-2" : "space-y-3"}>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden
      />
      <div className={compact ? "flex-1" : ""}>
        <label htmlFor={`newsletter-${source}`} className="sr-only">Email address</label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 rounded-full border border-input bg-surface px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium px-5 hover:opacity-90 transition disabled:opacity-50 shadow-[var(--shadow-card)]"
      >
        {state === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {msg && (
        <p className={`text-xs ${state === "ok" ? "text-success" : "text-destructive"}`}>{msg}</p>
      )}
    </form>
  );
}
