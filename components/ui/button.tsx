import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-mono uppercase tracking-wider cursor-pointer select-none transition-all duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card border border-primary/20 hover:bg-primary/95 active:translate-y-[2px] active:shadow-pressed",
        destructive:
          "bg-destructive text-destructive-foreground shadow-card border border-destructive/20 hover:bg-destructive/95 active:translate-y-[2px] active:shadow-pressed",
        outline:
          "border border-border bg-background shadow-recessed text-foreground hover:bg-muted/50 active:translate-y-[1px] active:shadow-pressed",
        secondary:
          "bg-secondary text-secondary-foreground shadow-card border border-white/60 hover:bg-secondary/90 active:translate-y-[2px] active:shadow-pressed",
        ghost:
          "text-foreground hover:bg-muted/40 active:bg-muted/60",
        link:
          "text-primary underline-offset-4 hover:underline normal-case font-sans text-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-[10px]",
        lg: "h-12 rounded-xl px-8 text-sm",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
