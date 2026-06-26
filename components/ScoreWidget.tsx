"use client";

import React, { useEffect, useState } from "react";

interface ScoreWidgetProps {
  overallScore: number;
  subScores: {
    performance?: number;
    value?: number;
    design?: number;
    easeOfUse?: number;
  };
  productName: string;
}

export default function ScoreWidget({ overallScore, subScores, productName }: ScoreWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // SVG parameters
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 10) * circumference;

  useEffect(() => {
    // Staggered trigger for animating the SVG stroke-dasharray
    const timer = setTimeout(() => {
      setAnimatedProgress(overallScore);
    }, 150);
    return () => clearTimeout(timer);
  }, [overallScore]);

  // Determine score colors
  // accent if >=7, neutral if 5-6.9, muted-red if <5
  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-primary stroke-primary";
    if (score >= 5) return "text-muted-foreground stroke-muted-foreground";
    return "text-red-600 stroke-red-600";
  };

  const getVerdict = (score: number) => {
    if (score >= 8.5) return { text: "HIGHLY RECOMMENDED", bg: "bg-primary text-primary-foreground" };
    if (score >= 7.0) return { text: "RECOMMENDED", bg: "bg-accent-light text-primary border border-primary/20" };
    if (score >= 5.0) return { text: "CONSIDER IT", bg: "bg-secondary text-muted-foreground" };
    return { text: "SKIP IT", bg: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/40" };
  };

  const verdict = getVerdict(overallScore);

  const subScoreItems = [
    { label: "Performance", score: subScores.performance ?? 0 },
    { label: "Value", score: subScores.value ?? 0 },
    { label: "Design", score: subScores.design ?? 0 },
    { label: "Ease of Use", score: subScores.easeOfUse ?? 0 },
  ];

  return (
    <div className="w-full bg-secondary/40 border border-border p-6 md:p-8 rounded-[6px] my-10 transition-colors duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left Side: Circular score badge & verdict */}
        <div className="flex flex-col items-center text-center space-y-4 md:border-r border-border md:pr-12 shrink-0 w-full md:w-auto">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circle */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-border-emphasis fill-transparent"
                strokeWidth="6"
              />
              {/* Foreground animated ring */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`fill-transparent transition-all duration-700 ease-out ${getScoreColor(overallScore)}`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-4xl text-foreground mt-1 select-none">
                {overallScore.toFixed(1)}
              </span>
              <span className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest">
                OUT OF 10
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`font-sans text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${verdict.bg}`}>
              {verdict.text}
            </span>
          </div>
        </div>

        {/* Right Side: Score breakdown bars */}
        <div className="flex-1 w-full space-y-4">
          <h4 className="font-display font-medium text-lg text-foreground border-b border-border pb-2">
            Optura Vibe Scorecard
          </h4>
          <div className="space-y-3.5">
            {subScoreItems.map((item, idx) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-end font-sans text-xs">
                  <span className="font-medium text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {item.score.toFixed(1)}/10
                  </span>
                </div>
                {/* Score bar */}
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${item.score * 10}%`,
                      transitionDelay: `${idx * 60}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
