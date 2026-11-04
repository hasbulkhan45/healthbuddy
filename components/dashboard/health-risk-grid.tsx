"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Droplets, Activity, Apple, Dna, ShieldCheck } from "lucide-react";
import { mockHealthRisks } from "@/data/mock/health-risks";
import { StatusBadge } from "@/components/shared/status-badge";

export function HealthRiskGrid() {
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Cardiovascular":
        return {
          icon: Heart,
          gradient: "from-rose-500 to-pink-500",
          bgTint: "from-white to-pink-50/30",
          borderHover: "hover:border-pink-300",
        };
      case "Diabetes":
        return {
          icon: Droplets,
          gradient: "from-amber-500 to-orange-500",
          bgTint: "from-white to-amber-50/30",
          borderHover: "hover:border-amber-300",
        };
      case "Kidney":
        return {
          icon: Activity,
          gradient: "from-cyan-500 to-teal-500",
          bgTint: "from-white to-cyan-50/30",
          borderHover: "hover:border-cyan-300",
        };
      case "Liver":
        return {
          icon: Activity,
          gradient: "from-emerald-500 to-teal-500",
          bgTint: "from-white to-emerald-50/30",
          borderHover: "hover:border-emerald-300",
        };
      case "Anaemia":
        return {
          icon: Dna,
          gradient: "from-indigo-500 to-purple-600",
          bgTint: "from-white to-purple-50/30",
          borderHover: "hover:border-purple-300",
        };
      default:
        return {
          icon: Apple,
          gradient: "from-blue-500 to-cyan-500",
          bgTint: "from-white to-blue-50/30",
          borderHover: "hover:border-blue-300",
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Preventive Health Risk Overview
          </h2>
          <p className="text-xs text-slate-500">
            Multi-system qualitative evaluations based on verified laboratory panels and clinical guidelines.
          </p>
        </div>
        <Link
          href="/health-risks"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>Deep-Dive Screening</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {mockHealthRisks.map((risk) => {
          const styles = getCategoryStyles(risk.category);
          const Icon = styles.icon;
          return (
            <Link
              key={risk.id}
              href={`/health-risks#${risk.id}`}
              className={`group rounded-2xl border border-slate-200/80 bg-gradient-to-br ${styles.bgTint} p-5 shadow-xs transition-all ${styles.borderHover} hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr ${styles.gradient} text-white shadow-xs`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {risk.category}
                    </span>
                  </div>
                  <StatusBadge status={risk.status} customLabel={risk.statusLabel} size="sm" />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {risk.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Assessed: {risk.lastAssessmentDate}</span>
                <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Details <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
