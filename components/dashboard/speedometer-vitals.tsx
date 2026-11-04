"use client";

import React from "react";
import Link from "next/link";
import { HealthMeasurement } from "@/types/health";
import { StatusBadge } from "@/components/shared/status-badge";
import { Heart, Activity, Droplets, Wind, Scale, ArrowRight } from "lucide-react";

interface SpeedometerVitalsProps {
  measurements: HealthMeasurement[];
}

export function SpeedometerVitals({ measurements }: SpeedometerVitalsProps) {
  const getMetric = (type: string) =>
    measurements.find((m) => m.metricType === type);

  const bp = getMetric("blood_pressure");
  const hr = getMetric("heart_rate");
  const glu = getMetric("blood_glucose");
  const spo2 = getMetric("spo2");
  const wt = getMetric("weight");
  const bmi = getMetric("bmi");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Key Health Indicators & Speedometer Gauges
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated multi-color visual identities benchmarked against clinical reference intervals.
          </p>
        </div>
        <Link
          href="/health-overview"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>View All Measurements</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Blood Pressure: Electric Blue Identity */}
        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/40 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-2xs">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Blood Pressure</span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Electric Blue</span>
              </div>
            </div>
            <StatusBadge status="normal" customLabel="Optimal" size="sm" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {bp?.formattedValue || "120/80"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">mmHg</span>
          </div>

          {/* Visual BP Range Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>Systolic: 120 (Target &lt; 120)</span>
              <span>Diastolic: 80 (&lt; 80)</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-slate-200/70 overflow-hidden shadow-2xs">
              <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-l-full" />
              <div className="absolute inset-y-0 left-2/3 w-1/6 bg-amber-300" />
              <div className="absolute inset-y-0 right-0 w-1/6 bg-rose-400 rounded-r-full" />
              {/* Pointer */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-blue-700 rounded-full shadow-sm"
                style={{ left: "55%" }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Ref: 90/60 – 120/80 mmHg (AHA Standard)</p>
          </div>
        </div>

        {/* 2. Heart Health: Coral & Pink Identity */}
        <div className="rounded-2xl border border-pink-200/80 bg-gradient-to-br from-white to-pink-50/40 p-5 shadow-xs hover:shadow-md hover:border-pink-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-pink-600 shadow-2xs">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Resting Heart Rate</span>
                <span className="text-[10px] font-semibold text-pink-600 uppercase tracking-wider">Coral & Pink</span>
              </div>
            </div>
            <StatusBadge status="normal" customLabel="Normal" size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {hr?.formattedValue || "72"}
              </span>
              <span className="text-xs text-slate-500 font-semibold">bpm</span>
            </div>

            {/* Semicircular Speedometer Arc with Pink-to-Coral Gradient */}
            <div className="relative w-16 h-9 flex items-center justify-center">
              <svg viewBox="0 0 40 20" className="w-16 h-9 overflow-visible">
                <defs>
                  <linearGradient id="heartSpeedoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#F04452" />
                  </linearGradient>
                </defs>
                <path
                  d="M 4 18 A 16 16 0 0 1 36 18"
                  fill="none"
                  stroke="#FCE7F3"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 4 18 A 16 16 0 0 1 36 18"
                  fill="none"
                  stroke="url(#heartSpeedoGrad)"
                  strokeWidth="3.5"
                  strokeDasharray="50.2"
                  strokeDashoffset="24"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute bottom-0 text-[10px] font-mono font-extrabold text-pink-700">
                72
              </span>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Resting: 60–100 bpm</span>
              <span className="text-pink-600 font-bold">-2 bpm 7d avg</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Normal sinus resting rhythm</p>
          </div>
        </div>

        {/* 3. Glucose: Orange & Amber Identity */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-2xs">
                <Droplets className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Fasting Glucose</span>
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Orange & Amber</span>
              </div>
            </div>
            <StatusBadge status="normal" customLabel="Normal" size="sm" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {glu?.formattedValue || "96"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">mg/dL</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
              <span>70 (Normal)</span>
              <span className="text-amber-700 font-bold">96 mg/dL</span>
              <span>99</span>
              <span>126+</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-slate-200/70 overflow-hidden shadow-2xs">
              <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-emerald-400 to-amber-300" />
              <div className="absolute inset-y-0 left-3/5 w-1/4 bg-amber-400" />
              <div className="absolute inset-y-0 right-0 w-[15%] bg-rose-400" />
              {/* Pointer */}
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-orange-600 rounded-full shadow-sm"
                style={{ left: "50%" }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Standard fasting range: 70–99 mg/dL</p>
          </div>
        </div>

        {/* 4. Blood Oxygen (SpO2): Cyan Identity */}
        <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-white to-cyan-50/40 p-5 shadow-xs hover:shadow-md hover:border-cyan-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 shadow-2xs">
                <Wind className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Oxygen Saturation</span>
                <span className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">Cyan Glow</span>
              </div>
            </div>
            <StatusBadge status="normal" customLabel="Optimal" size="sm" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900">
                {spo2?.formattedValue || "98"}
              </span>
              <span className="text-xs text-slate-500 font-semibold">%</span>
            </div>

            {/* Glowing Cyan Circular Progress Ring */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-11 h-11 -rotate-90">
                <defs>
                  <linearGradient id="cyanRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#0891B2" />
                  </linearGradient>
                </defs>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#CFFAFE"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#cyanRingGrad)"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  strokeDashoffset="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-cyan-800">98</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 pt-1">
            Normal ambient saturation (Clinical threshold ≥ 95%)
          </p>
        </div>

        {/* 5. Weight & BMI: Vibrant Purple Identity */}
        <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-2xs">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Body Mass Index</span>
                <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Vibrant Purple</span>
              </div>
            </div>
            <StatusBadge status="normal" customLabel="Normal" size="sm" />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {bmi?.formattedValue || "21.6"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg/m²</span>
          </div>

          {/* 4-Segmented Horizontal Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden shadow-2xs">
              <div className="bg-sky-200" title="Underweight < 18.5" />
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 relative" title="Normal 18.5 - 24.9">
                <div className="absolute top-0 bottom-0 left-1/2 w-1.5 bg-white rounded-full shadow-xs" />
              </div>
              <div className="bg-amber-300" title="Overweight 25 - 29.9" />
              <div className="bg-rose-300" title="Obese ≥ 30" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>&lt; 18.5</span>
              <span className="font-bold text-purple-700">18.5–24.9</span>
              <span>25–29.9</span>
              <span>≥ 30</span>
            </div>
          </div>
        </div>

        {/* 6. Weight: Turquoise & Mint Identity */}
        <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-white to-teal-50/40 p-5 shadow-xs hover:shadow-md hover:border-teal-300 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-2xs">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Body Weight</span>
                <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Turquoise & Mint</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-full border border-teal-200 shadow-2xs">
              -0.4 kg (30d)
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {wt?.formattedValue || "68.5"}
            </span>
            <span className="text-xs text-slate-500 font-semibold">kg</span>
          </div>

          <div className="pt-1">
            <p className="text-[11px] text-slate-600 font-medium">
              Target range for 178 cm height: <strong>60 – 76 kg</strong>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Recorded yesterday at 07:30 AM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
