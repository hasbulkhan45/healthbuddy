"use client";

import React, { useState } from "react";
import { Search, FolderOpen, Clock, AlertCircle, Info } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Input } from "@/components/ui/input";
import { mockLabTests } from "@/data/mock/lab-test-library";

export default function LabTestsPage() {
  const [query, setQuery] = useState("");

  const filtered = mockLabTests.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell
      title="Lab Test Reference Library"
      description="Clinical directory of common blood tests, biochemical markers, reference ranges, and fasting preparations."
      breadcrumbs={[{ label: "Lab Test Library" }]}
    >
      <div className="space-y-6 max-w-5xl">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search lab tests (e.g. HbA1c, Cholesterol, Creatinine, ALT)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none text-xs focus-visible:ring-0 p-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {test.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 pt-1">
                  {test.name}
                </h3>
                <p className="text-xs font-mono font-semibold text-slate-700">
                  Standard Ref: {test.typicalAdultRange}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block">Description:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{test.description}</p>
                </div>
                <div>
                  <span className="font-semibold text-teal-800 block">Clinical Significance:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{test.clinicalSignificance}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3 text-slate-500" />
                    Preparation & Fasting:
                  </span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px]">{test.preparationNotes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

