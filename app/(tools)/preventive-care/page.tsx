"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Calendar, CheckCircle2, Clock, Info } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { careService } from "@/services/careService";
import { PreventiveCareItem } from "@/types/care";

export default function PreventiveCarePage() {
  const [items, setItems] = useState<PreventiveCareItem[]>([]);

  useEffect(() => {
    careService.getPreventiveCare().then(setItems);
  }, []);

  return (
    <PageShell
      title="Preventive Healthcare & Screenings"
      description="Age and lifestyle-correlated preventive screening checklists, immunizations, and clinical exams."
      breadcrumbs={[{ label: "Preventive Care" }]}
    >
      <div className="space-y-6 max-w-4xl">
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-teal-900 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <p>
            <strong>Preventive Intelligence:</strong> Screenings are guidelines for early detection and preventive wellness. Specific recommendations should be tailored in dialogue with your primary care provider based on individual risk profile and medical history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {item.category}
                  </span>
                  <StatusBadge
                    status={item.status === "Up to date" ? "completed" : "borderline"}
                    customLabel={item.status}
                    size="sm"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <strong>Clinical Rationale:</strong> {item.importanceExplanation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3" />
                  Target: {item.dueDate}
                </span>
                <span className="text-teal-700 font-semibold">Active Checklist</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

