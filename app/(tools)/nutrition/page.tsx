"use client";

import React, { useState } from "react";
import { Apple, Info, CheckCircle2, Utensils, Heart } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export default function NutritionPage() {
  const [selectedPlan, setSelectedPlan] = useState("mediterranean");

  return (
    <PageShell
      title="Nutrition & Balanced Plate Guide"
      description="General dietary literacy, balanced plate breakdowns, and cardiovascular-supportive nutrition concepts."
      breadcrumbs={[{ label: "Nutrition Guide" }]}
    >
      <div className="space-y-6 max-w-5xl">
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-teal-900 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <p>
            <strong>Educational Nutrition Notice:</strong> Guidance provided is general nutritional education and does not constitute a specialized medical diet prescription (e.g. for chronic kidney disease, severe celiac disease, or advanced inborn errors of metabolism).
          </p>
        </div>

        {/* The Balanced Plate Diagram */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                The Standard Clinical Balanced Plate
              </h3>
              <p className="text-xs text-slate-500">
                Visual proportion guidelines supported by preventive cardiovascular and metabolic research.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
              Harvard Plate Model
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-900">50% Colorful Vegetables & Greens</span>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Leafy greens (spinach, kale), cruciferous vegetables (broccoli, cauliflower), and antioxidant polyphenols. Abundant dietary fiber slows postprandial glucose absorption.
              </p>
            </div>
            <div className="rounded-xl bg-sky-50/80 border border-sky-200/80 p-4 space-y-2">
              <span className="text-xs font-bold text-sky-900">25% Quality Protein Sources</span>
              <p className="text-xs text-sky-800 leading-relaxed">
                Fish rich in omega-3 (salmon, sardines), poultry, legumes (lentils, chickpeas), and tofu. Preserves lean muscular tissue and satiety.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-4 space-y-2">
              <span className="text-xs font-bold text-amber-900">25% Complex Whole Grains</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                Intact grains including quinoa, brown rice, steel-cut oats, and farro. Provides sustained slow-release glycogen without precipitous insulin spikes.
              </p>
            </div>
          </div>
        </div>

        {/* Nutritional Focus Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              Cardiovascular Lipid Optimization
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Emphasize monounsaturated fats from extra virgin olive oil and avocados.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Increase soluble viscous fiber (oat beta-glucan, psyllium, legumes) to assist LDL clearance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Limit ultra-processed industrial trans-fats and excessive refined sodium.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-teal-600" />
              Fasting Glycemic Regularity
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Pair carbohydrates with protein and healthy fats to blunt rapid blood sugar spikes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Maintain adequate hydration (2–3 liters daily) to assist optimal renal excretion.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Incorporate gentle post-meal walking to stimulate non-insulin-mediated glucose uptake.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

