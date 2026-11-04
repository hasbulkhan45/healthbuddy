import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoModeBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export function DemoModeBadge({ className, showIcon = true }: DemoModeBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-2xs backdrop-blur-xs select-none",
        className
      )}
      title="All health records, vitals, and reports are illustrative fictional demonstration data."
    >
      {showIcon && <Info className="h-3 w-3 text-slate-400" />}
      <span className="text-slate-500">Demo Data</span>
    </div>
  );
}

