"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { mockAIInsights } from "@/data/mock/insights";

export function AIInsightsStrip() {
  const getIconContainer = (severity: string) => {
    switch (severity) {
      case "positive":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
        );
      case "attention":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xs">
            <Calendar className="h-3.5 w-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Personalized AI Health Insights
            </h2>
          </div>
          <span className="rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/80">
            Indigo & Violet Identity
          </span>
        </div>
        <Link
          href="/ai-buddy"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
        >
          <span>Ask AI Buddy</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {mockAIInsights.map((ins) => (
          <div
            key={ins.id}
            className="rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-white via-white to-indigo-50/30 p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-300 hover:shadow-md transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {ins.category}
                </span>
                {getIconContainer(ins.severity)}
              </div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-800 transition-colors leading-snug">
                {ins.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ins.explanation}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-mono font-medium text-slate-400">
                {ins.relatedMetric}
              </span>
              <Link
                href={ins.suggestedActionHref}
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-0.5 group-hover:translate-x-0.5"
              >
                <span>{ins.suggestedActionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
