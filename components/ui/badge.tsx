import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-700 border border-slate-200/60",
        secondary:
          "bg-slate-100 text-slate-800",
        outline:
          "text-slate-700 border border-slate-200",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200/80",
        danger:
          "bg-rose-50 text-rose-700 border border-rose-200/80",
        teal:
          "bg-teal-50 text-teal-800 border border-teal-200/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

