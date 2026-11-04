"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { mockHealthRisks } from "@/data/mock/health-risks";

export default function HealthRisksPage() {
  return (
    <PageShell
      title="Preventive Health Risk Screening"
      description="Systematic screening evaluations across metabolic, cardiovascular, renal, and hematologic factors."
      breadcrumbs={[{ label: "Health Risks" }]}
      action={
        <Button size="sm" asChild className="gap-1.5">
          <Link href="/ai-buddy">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Consult AI Buddy</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Prominent Educational Safety Disclaimer */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold">Clinical Safety Notice</h3>
            <p className="leading-relaxed">
              HealthBuddy risk screenings represent educational correlation markers, not definitive medical diagnoses or deterministic risk scores. No clinical algorithm replaces a comprehensive consultation with a qualified medical professional.
            </p>
          </div>
        </div>

        {/* 6 Category Deep-Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockHealthRisks.map((risk) => (
            <div
              key={risk.id}
              id={risk.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {risk.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {risk.title}
                  </h3>
                </div>
                <StatusBadge status={risk.status} customLabel={risk.statusLabel} />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {risk.description}
              </p>

              {/* Contributing Factors */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Contributing Factors
                </span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {risk.contributingFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Available vs Missing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Available Markers ({risk.availableDataPoints.length})
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {risk.availableDataPoints.map((pt, i) => (
                      <li key={i} className="truncate">• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
                  <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                    Missing Data ({risk.missingDataPoints.length})
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-500">
                    {risk.missingDataPoints.map((pt, i) => (
                      <li key={i} className="truncate">• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-100">
                {risk.clinicalDisclaimer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

