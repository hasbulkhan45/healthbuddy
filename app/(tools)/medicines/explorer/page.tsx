"use client";

import React, { useState } from "react";
import { Search, Pill, AlertCircle, Info, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Input } from "@/components/ui/input";

export default function MedicineExplorerPage() {
  const [query, setQuery] = useState("");

  const medicineDirectory = [
    {
      name: "Vitamin D3 (Cholecalciferol)",
      ingredient: "Cholecalciferol",
      category: "Dietary Supplement / Vitamin",
      indication: "Supports calcium homeostasis, bone density maintenance, and normal immune function.",
      commonWarnings: "Consult physician if diagnosed with hypercalcemia or renal stones. Routine serum 25(OH)D monitoring advised.",
    },
    {
      name: "Omega-3 Fatty Acids (EPA/DHA)",
      ingredient: "Eicosapentaenoic Acid / Docosahexaenoic Acid",
      category: "Lipid Support / Supplement",
      indication: "Assists in maintaining healthy circulating triglyceride levels and cellular membrane fluid dynamics.",
      commonWarnings: "High doses (> 3g/day) may mildly increase bleeding time; exercise caution if taking concurrent anticoagulant therapy.",
    },
    {
      name: "Cetirizine Hydrochloride",
      ingredient: "Cetirizine HCl",
      category: "Antihistamine (2nd Generation)",
      indication: "Relief of allergic rhinitis symptoms including sneezing, rhinorrhea, and ocular pruritus.",
      commonWarnings: "Although classified as non-drowsy, mild somnolence can occur in sensitive individuals. Avoid alcohol.",
    },
    {
      name: "Metformin Hydrochloride",
      ingredient: "Metformin HCl",
      category: "Biguanide Antidiabetic",
      indication: "First-line pharmacological agent for glycemic management in Type 2 Diabetes; improves insulin sensitivity.",
      commonWarnings: "Take with meals to minimize gastrointestinal discomfort. Temporary discontinuation required prior to iodinated radiocontrast procedures.",
    },
    {
      name: "Lisinopril",
      ingredient: "Lisinopril Dihydrate",
      category: "ACE Inhibitor",
      indication: "Management of essential hypertension and cardioprotection in chronic renal disease.",
      commonWarnings: "Monitor serum potassium and renal markers. Contact physician if experiencing persistent dry cough or angioedema.",
    },
    {
      name: "Atorvastatin Calcium",
      ingredient: "Atorvastatin",
      category: "HMG-CoA Reductase Inhibitor (Statin)",
      indication: "Primary and secondary cardiovascular prevention by reducing circulating low-density lipoprotein (LDL).",
      commonWarnings: "Report unexplained muscle pain or tenderness (myopathy). Periodic liver function monitoring recommended.",
    },
  ];

  const filtered = medicineDirectory.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.ingredient.toLowerCase().includes(query.toLowerCase()) ||
      m.indication.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell
      title="Medicine Reference Explorer"
      description="Search general active ingredient details, indications, and clinical warnings."
      breadcrumbs={[
        { label: "Medicines", href: "/medicines" },
        { label: "Medicine Explorer" },
      ]}
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by drug name, active ingredient, or medical indication..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none text-xs focus-visible:ring-0 p-0"
          />
        </div>

        <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3.5 text-xs text-teal-900 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <p>
            <strong>Educational Demonstration:</strong> HealthBuddy does not prescribe, adjust doses, or provide formal pharmaceutical dispensations. Always consult your prescribing physician or pharmacist before starting or modifying any treatment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 pt-1">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Active: {item.ingredient}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">General Clinical Indication:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{item.indication}</p>
                </div>
                <div>
                  <span className="font-semibold text-amber-800 block">Important Clinical Warnings:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{item.commonWarnings}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

