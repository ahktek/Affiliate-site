"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-5 w-full overflow-hidden rounded-md bg-muted shadow-recessed border border-border/40 p-[3px]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full rounded-[3px] bg-primary transition-all duration-300 relative shadow-[0_0_10px_rgba(255,71,87,0.5)] flex justify-end"
      style={{ width: `${value || 0}%` }}
    >
      <div className="w-1 h-full bg-white/40 border-l border-black/20" />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
