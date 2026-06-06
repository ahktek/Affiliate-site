"use client";

import React, { useState } from "react";

interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsConsWidget({ pros = [], cons = [] }: ProsConsProps) {
  const [showAllPros, setShowAllPros] = useState(false);
  const [showAllCons, setShowAllCons] = useState(false);

  const displayedPros = showAllPros ? pros : pros.slice(0, 5);
  const displayedCons = showAllCons ? cons : cons.slice(0, 5);

  const hasMorePros = pros.length > 5;
  const hasMoreCons = cons.length > 5;

  return (
    <div className="w-full border-t border-border-emphasis pt-8 my-12 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* PROS COLUMN */}
        <div className="space-y-4 pb-6 md:pb-0">
          <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-primary uppercase block">
            PROS
          </span>
          <ul className="space-y-3 font-body text-sm text-foreground">
            {displayedPros.map((pro, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-sans font-medium text-primary text-base select-none mt-[-2px]">
                  +
                </span>
                <span className="leading-relaxed">{pro}</span>
              </li>
            ))}
          </ul>
          {hasMorePros && (
            <button
              onClick={() => setShowAllPros(!showAllPros)}
              className="font-sans text-xs font-semibold text-primary hover:text-accent-hover transition-colors underline pt-1 block"
            >
              {showAllPros ? "Show less" : `Show ${pros.length - 5} more pros`}
            </button>
          )}
        </div>

        {/* CONS COLUMN */}
        <div className="space-y-4 pt-6 md:pt-0 md:pl-10">
          <span className="font-sans text-[0.75rem] font-semibold tracking-wider text-red-600 uppercase block">
            CONS
          </span>
          <ul className="space-y-3 font-body text-sm text-foreground">
            {displayedCons.map((con, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-sans font-medium text-red-600 text-base select-none mt-[-2.5px]">
                  –
                </span>
                <span className="leading-relaxed">{con}</span>
              </li>
            ))}
          </ul>
          {hasMoreCons && (
            <button
              onClick={() => setShowAllCons(!showAllCons)}
              className="font-sans text-xs font-semibold text-red-600 hover:text-red-700 transition-colors underline pt-1 block"
            >
              {showAllCons ? "Show less" : `Show ${cons.length - 5} more cons`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
