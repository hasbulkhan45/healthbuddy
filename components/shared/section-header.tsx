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
  className?: string;
}

export function SectionHeader({
  title,
  description,
  actionHref,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3",
        className
      )}
    >
      <div>
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors pt-1 sm:pt-0 shrink-0 group"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}

      {onAction && actionLabel && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors pt-1 sm:pt-0 shrink-0"
        >
          <span>{actionLabel}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

