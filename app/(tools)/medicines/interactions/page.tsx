"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Info,
  BookOpen,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { medicinesService } from "@/services/medicinesService";
import { DrugInteractionResult } from "@/types/medicine";
import { mockCommonMedicines } from "@/data/mock/drug-interactions";
import { toast } from "sonner";

export default function DrugInteractionsPage() {
  const [selectedMeds, setSelectedMeds] = useState<string[]>([
    "Aspirin (81 mg)",
    "Ibuprofen",
  ]);
  const [results, setResults] = useState<DrugInteractionResult[]>([]);
  const [hasChecked, setHasChecked] = useState(false);

  const handleAddMed = (med: string) => {
    if (selectedMeds.includes(med)) return;
    if (selectedMeds.length >= 4) {
      toast.error("Maximum 4 medicines for demo check");
      return;
    }
    setSelectedMeds([...selectedMeds, med]);
    setHasChecked(false);
  };

  const handleRemoveMed = (med: string) => {
    setSelectedMeds(selectedMeds.filter((m) => m !== med));
    setHasChecked(false);
  };

  const handleCheck = async () => {
    if (selectedMeds.length < 2) {
      toast.error("Select at least 2 medications to evaluate");
      return;
    }
    const res = await medicinesService.checkInteractions(selectedMeds);
    setResults(res);
    setHasChecked(true);
    toast.success("Interaction screening completed.");
  };

  return (
    <PageShell
      title="Drug Interaction Checker"
      description="Screen simultaneous medications and nutritional supplements for potential pharmacodynamic interactions."
      breadcrumbs={[
        { label: "Medicines", href: "/medicines" },
        { label: "Interaction Checker" },
      ]}
    >
      <div className="space-y-6 max-w-4xl">
        {/* Medicine Selector Canvas */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Selected Regimen for Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Add medications or supplements to test for potential pharmacokinetic interactions.
            </p>
          </div>

          {/* Active selection pills */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-xl border border-slate-200/60 items-center">
            {selectedMeds.length === 0 ? (
              <span className="text-xs text-slate-400 pl-1">
                Select medications below to begin...
              </span>
            ) : (
              selectedMeds.map((med) => (
                <span
                  key={med}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900 border border-teal-200/80"
                >
                  <span>{med}</span>
                  <button
                    onClick={() => handleRemoveMed(med)}
                    className="hover:text-rose-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Quick Add Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Common Candidates
            </span>
            <div className="flex flex-wrap gap-1.5">
              {mockCommonMedicines.map((m) => (
                <button
                  key={m}
                  onClick={() => handleAddMed(m)}
                  disabled={selectedMeds.includes(m)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  + {m}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Button onClick={handleCheck} className="gap-2">
              <ShieldAlert className="h-4 w-4" />
              <span>Evaluate Interactions</span>
            </Button>
          </div>
        </div>

        {/* Results Presentation */}
        {hasChecked && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Screening Results ({results.length})
            </h3>

            {results.map((res, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {res.medicineA} + {res.medicineB}
                    </span>
                  </div>
                  <StatusBadge
                    status={res.severityStatus}
                    customLabel={`Severity: ${res.severity}`}
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {res.explanation}
                  </p>
                  <p className="text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Mechanism:</strong> {res.clinicalMechanism}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Reference: {res.sourceReferences.join(", ")}
                  </span>
                  <span>Simulated Demonstration Engine</span>
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] text-slate-500 leading-normal">
              <strong>Clinical Notice:</strong> Demonstration interaction database only. Never stop, initiate, or adjust prescription doses without direct consultation with your prescribing physician or licensed clinical pharmacist.
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

