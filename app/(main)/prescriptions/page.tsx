"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Pill, UploadCloud } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { prescriptionService } from "@/services/prescriptionService";
import { Prescription } from "@/types/prescription";

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const load = () => {
    prescriptionService.getPrescriptions().then(setPrescriptions);
  };

  useEffect(() => {
    load();
    const unsub = prescriptionService.subscribe(load);
    return unsub;
  }, []);

  const pendingReview = useMemo(
    () => prescriptions.filter((item) => item.requiresUserReview || item.verificationStatus !== "user_confirmed").length,
    [prescriptions]
  );

  return (
    <PageShell
      title="Prescription Intelligence"
      description="Upload a prescription, review the extracted fields, and turn verified instructions into a care plan."
      headerBg="gradient"
      action={
        <Link href="/prescriptions/upload">
          <Button className="gap-2 badge-gradient-blue-indigo">
            <UploadCloud className="h-4 w-4" />
            <span>Upload prescription</span>
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-blue p-4 shadow-xs">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Total prescriptions</div>
            <div className="mt-3 text-2xl font-black text-slate-900">{prescriptions.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-amber p-4 shadow-xs">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Needs review</div>
            <div className="mt-3 text-2xl font-black text-amber-700">{pendingReview}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-emerald p-4 shadow-xs">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Confirmed</div>
            <div className="mt-3 text-2xl font-black text-emerald-700">
              {prescriptions.filter((item) => item.verificationStatus === "user_confirmed").length}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="rounded-2xl border border-slate-200/80 card-vibrant-indigo p-5 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg badge-gradient-blue-indigo text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">{prescription.documentName}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{prescription.doctorName} • {prescription.clinicName}</div>
                </div>
                <StatusBadge
                  status={prescription.verificationStatus === "user_confirmed" ? "completed" : prescription.verificationStatus === "needs_review" ? "borderline" : "pending"}
                  customLabel={prescription.verificationStatus === "user_confirmed" ? "Confirmed" : prescription.verificationStatus === "needs_review" ? "Needs review" : prescription.verificationStatus}
                  size="sm"
                />
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Prescription date</span>
                  <span className="font-medium text-slate-900">{prescription.prescriptionDate || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visit date</span>
                  <span className="font-medium text-slate-900">{prescription.visitDate || "Needs review"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Follow-up</span>
                  <span className="font-medium text-slate-900">{prescription.followUpDate || "Pending"}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/prescriptions/${prescription.id}`}>
                  <Button variant="secondary" size="sm" className="gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Review
                  </Button>
                </Link>
                <Link href={`/prescriptions/upload`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pill className="h-3.5 w-3.5" />
                    New upload
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {prescriptions.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 card-vibrant-slate p-12 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-900">No prescriptions yet</h3>
            <p className="mt-2 text-sm text-slate-500">Upload a prescription to see extraction, review, and care-plan generation.</p>
            <Link href="/prescriptions/upload" className="mt-4 inline-flex">
              <Button className="gap-2 badge-gradient-blue-indigo">
                <ArrowRight className="h-4 w-4" />
                Start with a prescription
              </Button>
            </Link>
          </div>
        )}
      </div>
    </PageShell>
  );
}