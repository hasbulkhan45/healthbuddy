"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  ShieldAlert,
  ClipboardList,
  BookOpen,
  Apple,
  FileCheck2,
  TrendingUp,
  FolderOpen,
  ArrowRight,
} from "lucide-react";

export function MoreToolsGrid() {
  const tools = [
    {
      title: "Medicine Explorer",
      description: "Search active ingredients, indications, and clinical warnings.",
      href: "/medicines/explorer",
      icon: Search,
      gradient: "from-blue-500 to-indigo-600 shadow-blue-500/25",
      tag: "Reference",
      tagBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Drug Interaction Checker",
      description: "Evaluate multi-drug compatibility and contraindications.",
      href: "/medicines/interactions",
      icon: ShieldAlert,
      gradient: "from-rose-500 to-amber-500 shadow-rose-500/25",
      tag: "Safety",
      tagBg: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      title: "Symptoms Journal",
      description: "Log symptom duration, severity (1-10), and potential triggers.",
      href: "/symptoms",
      icon: ClipboardList,
      gradient: "from-rose-500 to-pink-600 shadow-pink-500/25",
      tag: "Tracking",
      tagBg: "bg-pink-50 text-pink-700 border-pink-200",
    },
    {
      title: "Lab Test Library",
      description: "Directory of 20+ laboratory tests, units, and preparation guides.",
      href: "/lab-tests",
      icon: FolderOpen,
      gradient: "from-cyan-500 to-teal-600 shadow-cyan-500/25",
      tag: "Education",
      tagBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    },
    {
      title: "Health Knowledge Base",
      description: "Educational articles on cardiovascular wellness, metabolic regulation, and sleep.",
      href: "/knowledge-base",
      icon: BookOpen,
      gradient: "from-purple-500 to-indigo-600 shadow-purple-500/25",
      tag: "Articles",
      tagBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      title: "Nutrition & Balanced Plate",
      description: "General educational healthy eating guides and micronutrient planning.",
      href: "/nutrition",
      icon: Apple,
      gradient: "from-emerald-400 to-teal-500 shadow-emerald-500/25",
      tag: "Wellness",
      tagBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "Doctor Visit Summary",
      description: "Compile a concise 1-page health brief for your next physician consultation.",
      href: "/doctor-summary",
      icon: FileCheck2,
      gradient: "from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-500/25",
      tag: "Clinical Prep",
      tagBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      title: "Longitudinal Trends",
      description: "In-depth multi-metric analytics, rate-of-change, and historical logs.",
      href: "/health-trends",
      icon: TrendingUp,
      gradient: "from-indigo-600 to-pink-500 shadow-purple-500/25",
      tag: "Analytics",
      tagBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Explore Health Intelligence Tools
        </h2>
        <p className="text-xs text-slate-500">
          Specialized secondary modules for medication safety, symptom journaling, and clinical preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr ${tool.gradient} text-white shadow-xs transition-transform group-hover:scale-105`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-[10px] font-bold ${tool.tagBg} px-2 py-0.5 rounded-full border`}>
                    {tool.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>Launch Tool</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
