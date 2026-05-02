"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientBorderProps {
  children: ReactNode;
  intense?: boolean;
  className?: string;
}

export function GradientBorder({ children, intense = false, className }: GradientBorderProps) {
  return (
    <div className={cn("gradient-border", intense && "intense", className)}>
      <div className={cn("gradient-border-inner flex flex-col h-full")}>
        {children}
      </div>
    </div>
  );
}
