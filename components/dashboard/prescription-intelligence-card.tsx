"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Sparkles } from "lucide-react";
import { prescriptionService } from "@/services/prescriptionService";
import { Prescription } from "@/types/prescription";

export function PrescriptionIntelligenceCard() {
  const [items, setItems] = useState<Prescription[]>([]);

  const load = () => {
    prescriptionService.getPrescriptions().then(setItems);
  };

  useEffect(() => {
    load();
    const unsub = prescriptionService.subscribe(load);
    return unsub;
  }, []);

  const pending = items.filter((item) => item.requiresUserReview || item.verificationStatus !== "user_confirmed");

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prescription Intelligence</h3>
            <p className="text-[11px] text-slate-500">Upload, verify, and activate care plans</p>
          </div>
        </div>
        <Link href="/prescriptions" className="text-xs font-bold text-violet-700 hover:text-violet-800">Open</Link>
      </div>

      <div className="mt-4 space-y-3">
        {items.slice(0, 2).map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-violet-600 shrink-0" />
                <span className="truncate text-xs font-semibold text-slate-900">{item.documentName}</span>
              </div>
              {item.verificationStatus === "user_confirmed" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Clock3 className="h-3 w-3" /> Review
                </span>
              )}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">{item.doctorName} • {item.clinicName}</div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">No prescriptions uploaded yet.</div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-800">
        <span>{pending.length} prescription{pending.length === 1 ? "" : "s"} pending verification</span>
        <Link href="/prescriptions/upload" className="inline-flex items-center gap-1 font-bold">
          Upload new <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
