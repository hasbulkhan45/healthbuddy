"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Calendar,
  Building,
  User,
  ShieldCheck,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { reportsService } from "@/services/reportsService";
import { MedicalRecord, ExtractedLabResult } from "@/types/report";
import { toast } from "sonner";

interface RecordDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecordDetailPage({ params }: RecordDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const demoUserId = "demo-user-001";

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [loading, setLoading] = useState(true);

  const loadRecord = () => {
    reportsService.getReportById(id, demoUserId).then((rec) => {
      if (rec) setRecord({ ...rec });
      setLoading(false);
    });
  };

  useEffect(() => {
    loadRecord();
    const unsub = reportsService.subscribe(loadRecord);
    return () => { unsub(); };
  }, [id]);

  const handleConfirmResult = async (resultId: string) => {
    await reportsService.confirmResult(id, resultId, demoUserId);
    toast.success("Lab measurement verified by user.");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-xs text-slate-500">
        Loading document details...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-800">Record not found</p>
        <Button size="sm" onClick={() => router.push("/records")}>
          Return to Records
        </Button>
      </div>
    );
  }

  return (
    <PageShell
      title={record.title}
      breadcrumbs={[
        { label: "Medical Records", href: "/records" },
        { label: record.title },
      ]}
      badge={
        <StatusBadge
          status={record.verificationStatus === "Verified" ? "completed" : "borderline"}
          customLabel={record.verificationStatus}
          size="sm"
        />
      }
      action={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Simulated PDF download started.")}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/ai-buddy")}
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI About Report</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document Viewer Simulation (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-teal-700" />
              Document Preview
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-500 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Simulated High-Res Paper Document */}
          <div className="overflow-auto max-h-[600px] rounded-lg border border-slate-200 bg-slate-100/60 p-4 flex justify-center">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="w-full max-w-sm rounded bg-white p-6 shadow-md border border-slate-200 text-slate-800 space-y-4 transition-transform font-serif text-[11px] leading-relaxed"
            >
              {/* Lab Header */}
              <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                <h3 className="font-sans font-bold text-sm tracking-tight uppercase">
                  {record.institutionName}
                </h3>
                <p className="font-sans text-[10px] text-slate-500">
                  CLINICAL PATHOLOGY & LABORATORY MEDICINE
                </p>
              </div>

              {/* Patient Meta */}
              <div className="grid grid-cols-2 gap-2 font-sans text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400">PATIENT: </span>
                  <span className="font-bold">Alex Mercer</span>
                </div>
                <div>
                  <span className="text-slate-400">DATE: </span>
                  <span className="font-bold">{record.documentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">PHYSICIAN: </span>
                  <span className="font-bold">{record.physicianName || "Dr. S. Jenkins"}</span>
                </div>
                <div>
                  <span className="text-slate-400">SPECIMEN: </span>
                  <span className="font-bold">Plasma Fasting</span>
                </div>
              </div>

              {/* Lab Result Lines */}
              <div className="space-y-1 pt-1 font-mono text-[10px]">
                <div className="flex justify-between font-bold border-b border-slate-300 pb-1 text-slate-900">
                  <span>ANALYSIS</span>
                  <span>RESULT</span>
                  <span>REF. INTERVAL</span>
                </div>
                {record.extractedResults?.map((res, i) => (
                  <div key={i} className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="truncate max-w-[130px] font-sans">{res.testName}</span>
                    <span className="font-bold">{res.resultValue} {res.unit}</span>
                    <span className="text-slate-500">{res.referenceRange}</span>
                  </div>
                ))}
              </div>

              <div className="text-[9px] text-slate-400 pt-4 text-center font-sans border-t border-slate-200">
                Official Clinical Verification • HealthBuddy Demo Archive
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Lab Results Table & AI Interpretation (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Bar */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Institution</span>
              <span className="font-semibold text-slate-800">{record.institutionName}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Report Date</span>
              <span className="font-semibold text-slate-800">{record.documentDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Physician</span>
              <span className="font-semibold text-slate-800">{record.physicianName || "Dr. Sarah Jenkins"}</span>
            </div>
          </div>

          {/* AI Explanation Banner */}
          {record.aiExplanation && (
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-700" />
                <h3 className="text-xs font-bold text-teal-900">
                  AI Educational Summary
                </h3>
                <span className="rounded bg-teal-100 px-1.5 py-0.2 text-[10px] font-semibold text-teal-800">
                  Educational
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {record.aiExplanation}
              </p>
            </div>
          )}

          {/* Extracted Structured Lab Results Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Extracted Structured Lab Values
                </h3>
                <p className="text-xs text-slate-500">
                  Distinguishes extracted, user-confirmed, and reference intervals.
                </p>
              </div>
            </div>

            {record.extractedResults && record.extractedResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Test Name</th>
                      <th className="py-2.5 px-4">Result</th>
                      <th className="py-2.5 px-4">Unit</th>
                      <th className="py-2.5 px-4">Ref. Range</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {record.extractedResults.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {item.testName}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          {item.resultValue}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-medium">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {item.referenceRange}
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusBadge
                            status={item.status}
                            customLabel={item.statusLabel}
                            size="sm"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {item.extractionStatus === "user_confirmed" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle2 className="h-3 w-3" />
                              Confirmed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmResult(item.id)}
                              className="rounded bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800 hover:bg-teal-100 transition-colors border border-teal-200/80"
                            >
                              Confirm
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No individual numerical lab measurements extracted for this document.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

