import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageShellProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
  headerBg?: "default" | "gradient" | "subtle";
}

export function PageShell({
  title,
  description,
  badge,
  action,
  breadcrumbs,
  children,
  className,
  headerBg = "default",
}: PageShellProps) {
  const headerBgClasses = {
    default: "pb-6 border-b border-slate-200/70",
    gradient: "pb-6 border-b border-slate-200/70 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 rounded-2xl -mx-4 -mb-6 px-4 sm:px-6 pt-4",
    subtle: "pb-4 border-b border-slate-200/60",
  };

  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-16", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-slate-400 mb-3" aria-label="Breadcrumb">
          <Link href="/home" className="hover:text-slate-700 transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", headerBgClasses[headerBg])}>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Body */}
      <div className="pt-6 space-y-6">{children}</div>
    </div>
  );
}

