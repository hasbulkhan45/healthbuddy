import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-2 border-b border-slate-200/80",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-normal max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors pt-1 sm:pt-0 shrink-0 group"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {onAction && actionLabel && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors pt-1 sm:pt-0 shrink-0"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

