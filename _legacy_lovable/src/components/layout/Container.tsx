import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  size = "lg",
}: {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const max =
    size === "sm" ? "max-w-2xl" : size === "md" ? "max-w-4xl" : size === "xl" ? "max-w-7xl" : "max-w-6xl";
  return <div className={cn("mx-auto w-full px-5 sm:px-6 lg:px-8", max, className)}>{children}</div>;
}
