"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, FileText, Pill, Calendar, Activity, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { searchService } from "@/services/searchService";
import { SearchItem } from "@/types/search";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (query.trim()) {
      searchService.search(query).then(setResults);
    } else {
      searchService.search("home").then(setResults);
    }
  }, [query]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Navigation":
        return <Compass className="h-4 w-4 text-blue-600" />;
      case "Medical Records":
        return <FileText className="h-4 w-4 text-sky-700" />;
      case "Medicines":
        return <Pill className="h-4 w-4 text-amber-700" />;
      case "Appointments":
        return <Calendar className="h-4 w-4 text-emerald-700" />;
      default:
        return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden shadow-xl border-slate-200">
        <DialogHeader className="sr-only">
          <DialogTitle>Search HealthBuddy</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b border-slate-100 px-3.5 py-3 gap-2.5">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search records, vitals, medicines, appointments, tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            ESC
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200/80 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-700">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400 rounded bg-slate-50 px-1.5 py-0.5 border border-slate-100 shrink-0">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3.5 py-2 text-[11px] text-slate-400">
          <span>Navigate with arrows or click to select</span>
          <span>HealthBuddy Command</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

