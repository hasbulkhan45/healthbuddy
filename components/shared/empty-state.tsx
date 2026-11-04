import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "dashed" | "card";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: EmptyStateProps) {
  const variants = {
    default: "flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50",
    dashed: "flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50",
    card: "flex flex-col items-center justify-center text-center py-8 px-6 rounded-2xl border border-slate-200/80 bg-white shadow-xs",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

