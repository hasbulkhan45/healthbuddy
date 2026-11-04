import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/70",
        className
      )}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

