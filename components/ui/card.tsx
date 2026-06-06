import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showScrews?: boolean }
>(({ className, showScrews = true, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-2xl border border-border/80 bg-card text-card-foreground shadow-card transition-all duration-300",
      className
    )}
    {...props}
  >
    {showScrews && (
      <>
        {/* Top Left Screw */}
        <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center pointer-events-none select-none z-20">
          <div className="w-2 h-[1.5px] bg-foreground/30 rotate-[45deg]" />
        </div>
        {/* Top Right Screw */}
        <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center pointer-events-none select-none z-20">
          <div className="w-2 h-[1.5px] bg-foreground/30 rotate-[135deg]" />
        </div>
        {/* Bottom Left Screw */}
        <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center pointer-events-none select-none z-20">
          <div className="w-2 h-[1.5px] bg-foreground/30 rotate-[120deg]" />
        </div>
        {/* Bottom Right Screw */}
        <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-muted shadow-recessed border border-border/40 flex items-center justify-center pointer-events-none select-none z-20">
          <div className="w-2 h-[1.5px] bg-foreground/30 rotate-[30deg]" />
        </div>
      </>
    )}
    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showVents?: boolean }
>(({ className, showVents = true, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start justify-between p-6 pb-4", className)}
    {...props}
  >
    <div className="flex flex-col space-y-1.5 flex-1">{children}</div>
    {showVents && (
      <div className="flex gap-1 pl-4 pt-1 pointer-events-none select-none shrink-0">
        <div className="ventilator-slot" />
        <div className="ventilator-slot" />
        <div className="ventilator-slot" />
      </div>
    )}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("font-mono text-base font-bold uppercase tracking-wider text-foreground", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-xs text-muted-foreground font-mono", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-2", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

