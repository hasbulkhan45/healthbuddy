import React from "react";
import { cn } from "@/lib/utils";

export type HealthStatusType =
  | "normal"
  | "optimal"
  | "borderline"
  | "attention"
  | "abnormal"
  | "high"
  | "low"
  | "critical"
  | "not_assessed"
  | "pending"
  | "completed"
  | "upcoming";

interface StatusBadgeProps {
  status: HealthStatusType | string;
  customLabel?: string;
  className?: string;
  size?: "sm" | "default";
}

export function StatusBadge({
  status,
  customLabel,
  className,
  size = "default",
}: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "_");

  let styles = "bg-slate-50 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";
  let defaultLabel = "Standard";

  switch (normalized) {
    case "normal":
    case "optimal":
    case "completed":
      styles = "bg-emerald-50/90 text-emerald-800 border-emerald-200/90 shadow-2xs";
      dotColor = "bg-emerald-500";
      defaultLabel = "Normal";
      break;

    case "borderline":
    case "attention":
    case "follow_up_recommended":
    case "more_information_required":
      styles = "bg-amber-50/90 text-amber-900 border-amber-200/90 shadow-2xs";
      dotColor = "bg-amber-500";
      defaultLabel = "Attention";
      break;

    case "upcoming":
      styles = "bg-blue-50/90 text-blue-900 border-blue-200/90 shadow-2xs";
      dotColor = "bg-blue-500";
      defaultLabel = "Upcoming";
      break;

    case "abnormal":
    case "high":
    case "low":
    case "critical":
    case "risk_factors_identified":
      styles = "bg-rose-50/90 text-rose-900 border-rose-200/90 shadow-2xs";
      dotColor = "bg-rose-500";
      defaultLabel = "Out of Range";
      break;

    case "not_assessed":
      styles = "bg-slate-50 text-slate-600 border-slate-200";
      dotColor = "bg-slate-400";
      defaultLabel = "Not Assessed";
      break;

    case "pending":
    case "assessment_available":
      styles = "bg-cyan-50/90 text-cyan-900 border-cyan-200/90 shadow-2xs";
      dotColor = "bg-cyan-500";
      defaultLabel = "Available";
      break;
  }

  const label = customLabel || defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold select-none tracking-tight",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        styles,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 shadow-2xs", dotColor)} />
      {label}
    </span>
  );
}
