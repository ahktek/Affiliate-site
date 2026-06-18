"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface NewsletterFormProps {
  source?: string;
  compact?: boolean;
}

export function NewsletterForm({ source = "homepage", compact = false }: NewsletterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          source,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        toast.success("Successfully subscribed!");
        // Clear fields on success
        setName("");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        toast.error(data.error || "Subscription failed");
      }
    } catch (error: any) {
      console.error("Subscription submission error:", error);
      setStatus("error");
      setErrorMessage("Network error. Please try again later.");
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`flex flex-col ${compact ? "sm:flex-row sm:items-end gap-4" : "sm:flex-row sm:items-end gap-6 w-full"}`}>
        {!compact && (
          <div className="flex-1 flex flex-col space-y-1">
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full font-sans text-sm bg-transparent border-b border-border-emphasis pb-3 pt-2 px-1 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col space-y-1">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className={`w-full font-sans bg-transparent border-b border-border-emphasis px-1 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary transition-colors ${
              compact ? "text-xs pb-2.5 pt-2" : "text-sm pb-3 pt-2"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`bg-primary text-primary-foreground font-sans font-medium rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0 transition-all duration-200 whitespace-nowrap self-stretch sm:self-auto ${
            compact 
              ? "text-xs px-5 py-2.5 h-[36px]" 
              : "text-sm px-6 py-3 h-[42px] shadow-[0_4px_12px_rgba(200,80,42,0.18)]"
          }`}
        >
          {status === "submitting" ? "Subscribing..." : compact ? "Subscribe" : "Get Weekly Picks →"}
        </button>
      </form>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {status === "success" && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Glassmorphic Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatus("idle")}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-[8px] bg-card border border-border p-6 shadow-2xl z-10"
            >
              {/* Close button */}
              <button
                onClick={() => setStatus("idle")}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                {/* Animated checkmark circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 10 }}
                  className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary"
                >
                  <Check size={28} className="stroke-[3]" />
                </motion.div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl text-foreground">
                    You're on the list! 🎉
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Thank you for subscribing. We've sent a welcome email to check out. You'll now receive our weekly honest reviews, roundups, and exclusive SaaS deals.
                  </p>
                </div>

                <button
                  onClick={() => setStatus("idle")}
                  className="w-full bg-primary text-primary-foreground font-sans text-sm font-semibold py-3 rounded-[6px] hover:bg-accent-hover transition-colors mt-2"
                >
                  Awesome, got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
