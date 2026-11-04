"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, TrendingDown, TrendingUp, Sparkles } from "lucide-react";
import { healthService } from "@/services/healthService";
import { MetricTrendPoint } from "@/types/health";

export function AnalyticsTrendsChart() {
  const [selectedMetric, setSelectedMetric] = useState<string>("blood_pressure");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7D");
  const [chartData, setChartData] = useState<MetricTrendPoint[]>([]);

  useEffect(() => {
    healthService.getHistoricalTrends(selectedMetric).then(setChartData);
  }, [selectedMetric, selectedPeriod]);

  const metricsConfig: Record<
    string,
    {
      label: string;
      unit: string;
      current: string;
      delta: string;
      strokeColor: string;
      fillGradFrom: string;
      fillGradTo: string;
      pillActive: string;
      badgeText: string;
    }
  > = {
    blood_pressure: {
      label: "Blood Pressure",
      unit: "mmHg",
      current: "120/80",
      delta: "-2 mmHg",
      strokeColor: "#2563EB",
      fillGradFrom: "#3B82F6",
      fillGradTo: "#93C5FD",
      pillActive: "bg-blue-600 text-white shadow-blue-500/25",
      badgeText: "text-blue-700 bg-blue-50 border-blue-200",
    },
    heart_rate: {
      label: "Heart Rate",
      unit: "bpm",
      current: "72",
      delta: "-2 bpm",
      strokeColor: "#F04452",
      fillGradFrom: "#EC4899",
      fillGradTo: "#FBCFE8",
      pillActive: "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-rose-500/25",
      badgeText: "text-pink-700 bg-pink-50 border-pink-200",
    },
    blood_glucose: {
      label: "Glucose",
      unit: "mg/dL",
      current: "96",
      delta: "-2 mg/dL",
      strokeColor: "#F97316",
      fillGradFrom: "#F59E0B",
      fillGradTo: "#FDE68A",
      pillActive: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-orange-500/25",
      badgeText: "text-orange-700 bg-orange-50 border-orange-200",
    },
    weight: {
      label: "Weight",
      unit: "kg",
      current: "68.5",
      delta: "-0.4 kg",
      strokeColor: "#8B5CF6",
      fillGradFrom: "#7C3AED",
      fillGradTo: "#DDD6FE",
      pillActive: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/25",
      badgeText: "text-purple-700 bg-purple-50 border-purple-200",
    },
    spo2: {
      label: "SpO2",
      unit: "%",
      current: "98",
      delta: "Stable",
      strokeColor: "#06B6D4",
      fillGradFrom: "#0891B2",
      fillGradTo: "#CFFAFE",
      pillActive: "bg-cyan-600 text-white shadow-cyan-500/25",
      badgeText: "text-cyan-800 bg-cyan-50 border-cyan-200",
    },
  };

  const periods = ["7D", "30D", "3M", "6M", "1Y"];
  const currentCfg = metricsConfig[selectedMetric] || metricsConfig.blood_pressure;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-3 shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800">{label}</p>
          <p className="font-mono font-extrabold text-sm" style={{ color: currentCfg.strokeColor }}>
            {data.label || `${payload[0].value} ${currentCfg.unit}`}
          </p>
          {data.secondaryValue && (
            <p className="text-[10px] text-slate-500">
              Systolic: {data.value} • Diastolic: {data.secondaryValue}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      {/* Header with Title and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Health Analytics & Longitudinal Trends
          </h2>
          <p className="text-xs text-slate-500">
            Interactive multi-color curves with standardized clinical reference intervals.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 gap-0.5 self-start sm:self-auto border border-slate-200/60">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                selectedPeriod === p
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(metricsConfig).map(([id, cfg]) => {
          const isSelected = selectedMetric === id;
          return (
            <button
              key={id}
              onClick={() => setSelectedMetric(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs ${
                isSelected
                  ? cfg.pillActive
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{cfg.label}</span>
              <span
                className={`font-mono text-[11px] ${
                  isSelected ? "opacity-90" : "text-slate-400"
                }`}
              >
                {cfg.current}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas & Metric Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-2">
        <div className="lg:col-span-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="vibrantMetricGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={currentCfg.fillGradFrom} stopOpacity={0.4} />
                  <stop offset="70%" stopColor={currentCfg.fillGradTo} stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentCfg.strokeColor}
                strokeWidth={3}
                fill="url(#vibrantMetricGrad)"
                dot={{ r: 3.5, fill: currentCfg.strokeColor, strokeWidth: 1.5, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, fill: currentCfg.strokeColor, stroke: "#FFFFFF", strokeWidth: 2.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Side Statistics Panel */}
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border border-slate-200/80 p-4 flex flex-col justify-between space-y-4 shadow-2xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Current Baseline
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {currentCfg.current}
              </span>
              <span className="text-xs font-semibold text-slate-500">{currentCfg.unit}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-0.5">
              <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
              <span>{currentCfg.delta} vs baseline</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Range Window:</span>
              <span className="font-bold text-slate-800">{selectedPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evaluation:</span>
              <span className="font-bold text-blue-700">Optimal Baseline</span>
            </div>
          </div>

          <Link
            href="/health-trends"
            className="inline-flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-700 pt-2 border-t border-slate-100 group"
          >
            <span>Detailed Analytics</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
