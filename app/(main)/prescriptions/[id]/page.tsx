"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Calendar, CheckCircle2, ChevronRight, FileText, FileUp, Pill, ShieldAlert, Sparkles, Stethoscope, Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { prescriptionService } from "@/services/prescriptionService";
import { Prescription, PrescriptionMedicine } from "@/types/prescription";
import { toast } from "sonner";

export default function PrescriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    prescriptionService
      .getPrescription(id)
      .then((item) => {
        setPrescription(item || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load prescription");
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    const unsub = prescriptionService.subscribe(load);
    return unsub;
  }, [id]);

  // Compute medicinePlaceholder at top level - always called, handles null prescription safely
  const medicinePlaceholder = useMemo(
    () =>
      prescription && prescription.verificationStatus === "user_confirmed"
        ? [{
            id: `${prescription.id}-med-placeholder`,
            prescriptionId: prescription.id,
            medicineName: "Confirmed medication",
            strength: "As prescribed",
            dosage: "1",
            dosageUnit: "dose",
            frequency: "As directed",
            route: "Oral",
            timing: "Per instructions",
            beforeOrAfterFood: "As directed",
            duration: "Course duration per prescription",
            startDate: prescription.prescriptionDate || new Date().toISOString().split("T")[0],
            endDate: prescription.followUpDate || prescription.visitDate || "",
            additionalInstructions: prescription.generalInstructions.join(" ") || "Follow instructions from prescriber.",
            extractionConfidence: 0.9,
            verificationStatus: "user_confirmed" as const,
            isAsNeeded: false,
          }] as PrescriptionMedicine[]
        : [],
    [prescription]
  );

  // Sync medicines with medicinePlaceholder - always called
  useEffect(() => {
    setMedicines(medicinePlaceholder);
  }, [medicinePlaceholder]);

  // Early returns AFTER all hooks
  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-xs text-slate-500">Loading prescription details...</div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-800">Failed to load prescription</p>
        <p className="text-xs text-slate-500">{error}</p>
        <Button size="sm" onClick={load}>Retry</Button>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-800">Prescription not found</p>
        <Button size="sm" onClick={() => router.push("/prescriptions")}>Return to prescriptions</Button>
      </div>
    );
  }

  const hasReviewNeeded = prescription.requiresUserReview || prescription.verificationStatus !== "user_confirmed";

  const handleConfirm = async () => {
    await prescriptionService.verifyPrescription(prescription.id, "user_confirmed");
    toast.success("Prescription confirmed. Care plan and follow-up integration are now active.");
  };

  const handleNeedsReview = async () => {
    await prescriptionService.verifyPrescription(prescription.id, "needs_review");
    toast.info("Prescription marked for follow-up review.");
  };

  return (
    <PageShell
      title={prescription.documentName}
      breadcrumbs={[{ label: "Prescriptions", href: "/prescriptions" }, { label: prescription.documentName }]}
      badge={<StatusBadge status={prescription.verificationStatus === "user_confirmed" ? "completed" : prescription.verificationStatus === "needs_review" ? "borderline" : "pending"} customLabel={prescription.verificationStatus === "user_confirmed" ? "Confirmed" : prescription.verificationStatus === "needs_review" ? "Needs review" : prescription.verificationStatus} size="sm" />}
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Button size="sm" onClick={handleConfirm} className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirm prescription
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Original document</span>
              <FileUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-center text-sm text-slate-600">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 text-blue-700">
                <FileText className="h-8 w-8" />
              </div>
              <div className="font-semibold text-slate-900">{prescription.documentName}</div>
              <div className="mt-1">{prescription.fileType.toUpperCase()} document</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">Doctor and visit information</span>
              </div>
              {hasReviewNeeded && (
                <button onClick={handleNeedsReview} className="text-xs font-semibold text-amber-700">Mark for review</button>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InfoRow label="Doctor" value={prescription.doctorName} />
              <InfoRow label="Specialty" value={prescription.doctorSpecialty} />
              <InfoRow label="Clinic" value={prescription.clinicName} />
              <InfoRow label="Visit date" value={prescription.visitDate || "Needs review"} />
              <InfoRow label="Prescription date" value={prescription.prescriptionDate || "Needs review"} />
              <InfoRow label="Follow-up" value={prescription.followUpDate || "Pending verification"} />
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">Follow-up instruction</div>
              <div className="mt-1">{prescription.followUpInstruction}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Pill className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Prescribed medicines</span>
          </div>
          <div className="mt-4 space-y-3">
            {medicines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No medicines have been extracted yet. This area will populate once OCR review is processed.
              </div>
            ) : (
              medicines.map((medicine) => (
                <div key={medicine.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-slate-900">{medicine.medicineName}</div>
                    <StatusBadge status={medicine.verificationStatus === "user_confirmed" ? "completed" : medicine.verificationStatus === "needs_review" ? "borderline" : "pending"} customLabel={medicine.verificationStatus} size="sm" />
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs text-slate-600">
                    <InfoRow label="Strength" value={medicine.strength} />
                    <InfoRow label="Dosage" value={`${medicine.dosage} ${medicine.dosageUnit}`.trim()} />
                    <InfoRow label="Frequency" value={medicine.frequency} />
                    <InfoRow label="Route" value={medicine.route} />
                    <InfoRow label="Food" value={medicine.beforeOrAfterFood} />
                    <InfoRow label="Duration" value={medicine.duration} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-bold text-slate-900">Tests advised</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {prescription.testsAdvised.length === 0 ? <li>No tests advised in the extracted document.</li> : prescription.testsAdvised.map((test) => <li key={test}>• {test}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-slate-900">Safety & verification</span>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                OCR extraction is not a medical verification. Unclear handwriting or poorly legible fields remain marked for review.
              </div>
              <div>Diagnosis text: {prescription.diagnosisText}</div>
              <div>General instructions: {prescription.generalInstructions.join(" • ") || "No additional instructions were extracted."}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold text-slate-900">Generated care plan</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/care"><Button variant="secondary" size="sm" className="gap-1.5"><ArrowRight className="h-3.5 w-3.5" />View care hub</Button></Link>
            <Link href="/medicines"><Button variant="outline" size="sm" className="gap-1.5"><Pill className="h-3.5 w-3.5" />Open medicines</Button></Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value || "—"}</div>
    </div>
  );
}
