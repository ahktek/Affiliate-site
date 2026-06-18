"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface NewsletterFormProps {
  source: string;
  showName?: boolean;
  layout?: "homepage" | "blog";
  buttonText?: string;
}

export default function NewsletterForm({
  source,
  showName = false,
  layout = "homepage",
  buttonText,
}: NewsletterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("email", email);
    if (showName) {
      formData.append("name", name);
    }
    formData.append("source", source);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowPopup(true);
        setName("");
        setEmail("");
      } else {
        setErrorMsg(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isBlog = layout === "blog";
  const defaultButtonText = isBlog ? "Subscribe" : "Get Weekly Picks →";
  const displayButtonText = buttonText || defaultButtonText;

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col sm:flex-row sm:items-end ${isBlog ? "gap-4" : "gap-6"} w-full`}
      >
        {showName && !isBlog && (
          <div className="flex-1 flex flex-col space-y-1">
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={loading}
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
            disabled={loading}
            className={`w-full font-sans ${isBlog ? "text-xs pb-2.5" : "text-sm pb-3"} bg-transparent border-b border-border-emphasis pt-2 px-1 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-primary transition-colors`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-primary text-primary-foreground font-sans ${
            isBlog ? "text-xs px-5 py-2.5 h-[36px]" : "text-sm px-6 py-3 h-[42px]"
          } rounded-[6px] hover:bg-accent-hover hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200 shadow-[0_4px_12px_rgba(200,80,42,0.18)] whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center min-w-[120px]`}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
          ) : (
            displayButtonText
          )}
        </button>
      </form>

      {errorMsg && (
        <p className="text-red-500 font-sans text-xs mt-3 bg-red-500/10 dark:bg-red-500/20 px-3 py-1.5 rounded-[4px] border border-red-500/20">
          {errorMsg}
        </p>
      )}

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[420px] bg-card border border-border p-8 rounded-[6px] shadow-2xl text-center space-y-6"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/25">
                <Check size={32} />
              </div>

              <div className="space-y-2">
                <h4 className="font-display font-semibold text-2xl text-foreground">
                  You're on the list!
                </h4>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Thank you for subscribing. We've registered your email and will send our latest weekly software reviews, picks, and deals straight to your inbox.
                </p>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="w-full bg-primary text-primary-foreground font-sans text-sm font-semibold py-3 rounded-[6px] hover:bg-accent-hover transition-colors shadow-lg shadow-primary/10"
              >
                Awesome
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
