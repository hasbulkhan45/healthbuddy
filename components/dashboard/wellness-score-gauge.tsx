"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Info, ArrowUpRight, ShieldCheck } from "lucide-react";
import { WellnessScore } from "@/types/health";

interface WellnessScoreGaugeProps {
  data: WellnessScore;
}

export function WellnessScoreGauge({ data }: WellnessScoreGaugeProps) {
  // Semicircular arc calculation (radius 75, stroke 11)
  const radius = 75;
  const stroke = 11;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  const factorGradients: Record<string, string> = {
    "Blood Pressure Stability": "from-blue-500 to-cyan-500",
    "Resting Heart Rate": "from-rose-500 to-pink-500",
    "Metabolic / Glucose": "from-amber-400 to-orange-500",
    "Activity & Weight": "from-emerald-400 to-teal-500",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-white via-blue-50/25 to-purple-50/30 p-6 shadow-sm">
      {/* Decorative subtle ambient glow in background */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/15 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Score & Gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <svg
              height={radius * 1.55}
              width={radius * 2}
              className="overflow-visible"
            >
              {/* Background Arc */}
              <path
                d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${
                  radius * 2 - stroke / 2
                } ${radius}`}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={stroke}
                strokeLinecap="round"
              />
              {/* Filled Progress Arc with Blue-to-Violet Gradient */}
              <path
                d={`M ${stroke / 2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${
                  radius * 2 - stroke / 2
                } ${radius}`}
                fill="none"
                stroke="url(#wellnessBlueVioletGrad)"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="wellnessBlueVioletGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Central Score Display */}
            <div className="absolute top-9 flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                {data.score}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-violet-600 px-2.5 py-0.5 rounded-full shadow-2xs">
                {data.label}
              </span>
            </div>
          </div>

          {/* Text Description */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Overall Wellness Status
              </h2>
              <span className="rounded-full bg-blue-100/70 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Illustrative Demo
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              {data.summary}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
              <Info className="h-3 w-3 text-blue-500" />
              Not a medical diagnosis • Derived from stable vitals and recent labs
            </p>
          </div>
        </div>

        {/* Right: Sub-factors breakdown (Vibrant Gradient Progress Bars) */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-200/70 pt-4 lg:pt-0 lg:pl-6 space-y-2.5 min-w-[260px]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Contributing Balance Factors
          </span>
          {data.factors.map((f, i) => {
            const grad = factorGradients[f.name] || "from-blue-500 to-indigo-600";
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">{f.name}</span>
                  <span className="font-mono font-bold text-slate-800">{f.score}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/60 overflow-hidden shadow-2xs">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
