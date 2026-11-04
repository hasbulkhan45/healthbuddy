"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl font-sans text-xs",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-teal-700 group-[.toast]:text-white group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-lg",
        },
      }}
    />
  );
}

