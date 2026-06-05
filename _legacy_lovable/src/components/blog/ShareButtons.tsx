import { useEffect, useState } from "react";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.origin + path);
    }
  }, [path]);

  const enc = encodeURIComponent;
  const shareUrl = url || path;
  const twitter = `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(shareUrl)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const btn =
    "inline-flex items-center justify-center size-9 rounded-full border border-border/60 bg-surface hover:bg-accent hover:text-accent-foreground transition";

  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      <a className={btn} href={twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M18.244 2H21l-6.52 7.45L22 22h-6.83l-4.78-6.26L4.8 22H2l7-8L2 2h6.91l4.34 5.73L18.244 2Zm-2.4 18h1.86L8.27 4H6.3l9.544 16Z" />
        </svg>
      </a>
      <a className={btn} href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.6 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.48 3.04 5.48 7v7.44h-4.56v-6.6c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.53 1.71-2.53 3.48V22H7.82V8Z" />
        </svg>
      </a>
      <a className={btn} href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
        </svg>
      </a>
      <button onClick={copy} className={btn} aria-label="Copy link" type="button">
        {copied ? (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m5 12 5 5L20 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}
