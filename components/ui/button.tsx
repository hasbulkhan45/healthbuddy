import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-sm hover:from-blue-700 hover:to-indigo-800 hover:shadow-md",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/90",
        outline:
          "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-2xs",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
        link:
          "text-blue-600 underline-offset-4 hover:underline p-0 h-auto",
        subtle:
          "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/80",
        vibrant:
          "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-11 px-5 text-base rounded-lg",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-7 w-7 p-0 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
