"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, TrendingDown, Clock, ArrowRight, Activity } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { healthService } from "@/services/healthService";
import { MetricTrendPoint } from "@/types/health";

export default function HealthTrendsPage() {
  const [selectedMetric, setSelectedMetric] = useState("blood_pressure");
  const [selectedPeriod, setSelectedPeriod] = useState("7D");
  const [chartData, setChartData] = useState<MetricTrendPoint[]>([]);

  useEffect(() => {
    healthService.getHistoricalTrends(selectedMetric).then(setChartData);
  }, [selectedMetric, selectedPeriod]);

  // Deterministic statistical calculations
  const values = chartData.map((d) => d.value);
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const avgVal = values.length
    ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
    : 0;
  const delta = values.length >= 2 ? parseFloat((values[values.length - 1] - values[0]).toFixed(1)) : 0;

  const metrics = [
    { id: "blood_pressure", label: "Blood Pressure", unit: "mmHg" },
    { id: "heart_rate", label: "Heart Rate", unit: "bpm" },
    { id: "blood_glucose", label: "Blood Glucose", unit: "mg/dL" },
    { id: "weight", label: "Body Weight", unit: "kg" },
    { id: "spo2", label: "Blood Oxygen SpO2", unit: "%" },
  ];

  return (
    <PageShell
      title="Longitudinal Health Analytics & Trends"
      description="Deterministic trend calculations, rate-of-change metrics, and multi-period physiological tracking."
      breadcrumbs={[{ label: "Health Trends" }]}
    >
      <div className="space-y-6">
        {/* Controls: Metric Tabs & Period Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedMetric === m.id
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 gap-0.5 self-start sm:self-auto">
            {["7D", "30D", "3M", "6M", "1Y"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedPeriod === p
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Average Reading</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">{avgVal}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Period Delta</span>
            <p className={`text-xl font-bold font-mono mt-1 ${delta <= 0 ? "text-emerald-700" : "text-amber-700"}`}>
              {delta > 0 ? `+${delta}` : delta}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Minimum</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">{minVal}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Maximum</span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-1">{maxVal}</p>
          </div>
        </div>

        {/* Big Chart Area */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Observation Curve ({selectedPeriod})
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0F766E" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}`, "Value"]}
                  contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "0.5rem", borderColor: "#E2E8F0" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  fill="url(#trendsGradient)"
                  dot={{ r: 3, fill: "#0F766E" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

