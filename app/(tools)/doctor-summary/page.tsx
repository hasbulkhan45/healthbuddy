"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  Download,
  CheckSquare,
  Square,
  FileCheck2,
  Calendar,
  Sparkles,
  Info,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { mockUser, mockAllergies } from "@/data/mock/users";
import { mockLatestMeasurements } from "@/data/mock/health-metrics";
import { mockMedications } from "@/data/mock/medicines";
import { mockSymptoms } from "@/data/mock/symptoms";
import { mockMedicalRecords } from "@/data/mock/reports";
import { toast } from "sonner";

export default function DoctorSummaryPage() {
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeAllergies, setIncludeAllergies] = useState(true);
  const [includeSymptoms, setIncludeSymptoms] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    toast.success("Doctor Consultation Summary downloaded (demo PDF).");
  };

  return (
    <PageShell
      title="Doctor Visit Consultation Summary"
      description="Prepare a concise, structured 1-page clinical brief to share with your physician during upcoming consultations."
      breadcrumbs={[{ label: "Doctor Visit Summary" }]}
      headerBg="gradient"
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            <span>Print Summary</span>
          </Button>
          <Button size="sm" onClick={handleExportPDF} className="gap-1.5 badge-gradient-blue-indigo">
            <Download className="h-3.5 w-3.5" />
            <span>Export to PDF</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-w-4xl">
        {/* Section Inclusion Toggles */}
        <div className="rounded-xl border border-slate-200/80 card-vibrant-blue p-4 shadow-xs space-y-2.5">
          <span className="text-xs font-bold text-slate-800">
            Select Sections to Include in Summary:
          </span>
          <div className="flex flex-wrap gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeVitals}
                onChange={(e) => setIncludeVitals(e.target.checked)}
                className="rounded text-blue-700 focus:ring-blue-600"
              />
              <span>Recent Vitals</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeMeds}
                onChange={(e) => setIncludeMeds(e.target.checked)}
                className="rounded text-teal-700 focus:ring-teal-600"
              />
              <span>Active Medications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeAllergies}
                onChange={(e) => setIncludeAllergies(e.target.checked)}
                className="rounded text-rose-700 focus:ring-rose-600"
              />
              <span>Allergies</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSymptoms}
                onChange={(e) => setIncludeSymptoms(e.target.checked)}
                className="rounded text-amber-700 focus:ring-amber-600"
              />
              <span>Logged Symptoms</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLabs}
                onChange={(e) => setIncludeLabs(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>Recent Lab Results</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeQuestions}
                onChange={(e) => setIncludeQuestions(e.target.checked)}
                className="rounded text-indigo-700 focus:ring-indigo-600"
              />
              <span>Questions for Doctor</span>
            </label>
          </div>
        </div>

        {/* Printable Paper Document Container */}
        <div className="rounded-2xl border border-slate-200/80 card-vibrant-indigo p-8 shadow-xs space-y-6 text-slate-800">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-900 uppercase tracking-tight">
                PATIENT CONSULTATION BRIEF
              </h2>
              <p className="text-xs text-slate-500">
                Generated via HealthBuddy Personal Healthcare Platform &bull; Demo Patient Record
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 sm:text-right">
              <span>Date: Nov 4, 2026</span>
            </div>
          </div>

          {/* Patient Bio Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Patient Name</span>
              <span className="font-bold text-slate-900">{mockUser.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Age / Sex</span>
              <span className="font-bold text-slate-900">{mockUser.age} yrs &bull; {mockUser.sex}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Blood Group</span>
              <span className="font-bold text-slate-900">{mockUser.bloodGroup}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">BMI / Weight</span>
              <span className="font-bold text-slate-900">{mockUser.healthProfile.weightKg} kg (BMI {mockUser.healthProfile.bmi})</span>
            </div>
          </div>

          {/* Section 1: Recent Vitals */}
          {includeVitals && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                1. Recent Baseline Measurements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                {mockLatestMeasurements.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-2 rounded border border-slate-100 bg-white">
                    <span className="text-[10px] text-slate-400 font-sans block">{m.metricType.replace(/_/g, " ")}</span>
                    <span className="font-bold text-slate-900">{m.formattedValue} {m.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Active Medications & Supplements */}
          {includeMeds && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                2. Active Medications & Dietary Supplements
              </h3>
              <ul className="space-y-1 text-xs">
                {mockMedications.filter((m) => m.status === "Active").map((m) => (
                  <li key={m.id} className="flex justify-between py-1 border-b border-slate-50">
                    <div>
                      <strong className="text-slate-900">{m.name}</strong> ({m.strength})
                      <span className="text-slate-500 block text-[11px]">{m.userConfirmedInstructions}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{m.frequency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Allergies */}
          {includeAllergies && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                3. Documented Allergies & Drug Hypersensitivities
              </h3>
              <div className="flex flex-wrap gap-2">
                {mockAllergies.map((alg) => (
                  <div key={alg.id} className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-950 text-xs">
                    <strong>{alg.allergen}</strong> ({alg.severity} Severity) &mdash; {alg.reaction}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Recent Symptoms */}
          {includeSymptoms && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                4. Reported Symptom Episodes (Past 30 Days)
              </h3>
              <ul className="space-y-1 text-xs">
                {mockSymptoms.slice(0, 2).map((s) => (
                  <li key={s.id} className="py-1">
                    <strong>{s.symptomName}</strong> (Severity {s.severity}/10) on {s.startDate} &bull; Trigger notes: {s.possibleTriggers}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 5: Recent Lab Highlights */}
          {includeLabs && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                5. Recent Laboratory Highlights (Metabolic & Lipid Panel, Oct 24, 2026)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">Fasting Glucose</span>
                  <span className="font-bold">94 mg/dL (Ref: 70&ndash;99)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">HbA1c</span>
                  <span className="font-bold">{"5.4% (Ref: < 5.7%)"}</span>
                </div>
                <div className="p-2 bg-amber-50 rounded border border-amber-100">
                  <span className="text-[10px] text-amber-800 block font-sans">Total Cholesterol</span>
                  <span className="font-bold text-amber-900">{"208 mg/dL (Ref: < 200)"}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-500 block font-sans">HDL Cholesterol</span>
                  <span className="font-bold">{"58 mg/dL (Ref: > 40)"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Questions for Doctor */}
          {includeQuestions && (
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                6. Questions to Ask the Doctor
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                <li>How should my 208 mg/dL Total Cholesterol be interpreted alongside my protective 58 mg/dL HDL?</li>
                <li>Given my paternal history of essential hypertension, do you recommend any additional vascular tests (e.g. ApoB or hs-CRP)?</li>
                <li>Should I continue my current 2,000 IU Vitamin D3 and 1,000 mg Omega-3 routine during the winter months?</li>
              </ol>
            </div>
          )}

          {/* Footer note */}
          <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-200 text-center font-sans">
            Prepared by Patient Alex Mercer using HealthBuddy Personal Healthcare Platform &bull; Illustrative Demo Record
          </div>
        </div>
      </div>
    </PageShell>
  );
}