"use client";

import React, { useState, useEffect } from "react";
import { WellnessScoreGauge } from "@/components/dashboard/wellness-score-gauge";
import { SpeedometerVitals } from "@/components/dashboard/speedometer-vitals";
import { QuickActionsBar } from "@/components/dashboard/quick-actions-bar";
import { AnalyticsTrendsChart } from "@/components/dashboard/analytics-trends-chart";
import { TodayCarePlan } from "@/components/dashboard/today-care-plan";
import { AIInsightsStrip } from "@/components/dashboard/ai-insights-strip";
import { HealthRiskGrid } from "@/components/dashboard/health-risk-grid";
import { RecentActivityTimeline } from "@/components/dashboard/recent-activity-timeline";
import { MoreToolsGrid } from "@/components/dashboard/more-tools-grid";
import { healthService } from "@/services/healthService";
import { HealthMeasurement, WellnessScore } from "@/types/health";
import { mockUser } from "@/data/mock/users";
import { PrescriptionIntelligenceCard } from "@/components/dashboard/prescription-intelligence-card";

export default function HomeDashboardPage() {
  const [wellnessScore, setWellnessScore] = useState<WellnessScore | null>(null);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);

  const loadData = () => {
    healthService.getOverview().then((res) => {
      setWellnessScore(res.wellnessScore);
      setMeasurements(res.measurements);
    });
  };

  useEffect(() => {
    loadData();
    const unsub = healthService.subscribe(loadData);
    return unsub;
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-8">
      {/* A. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Good morning, {mockUser.fullName.split(" ")[0]}
            </h1>
            <span className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
              All Vitals Stable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
            Wednesday, November 4, 2026 • Welcome to your personal health intelligence companion.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200/90 px-3.5 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse shadow-xs" />
          <span>Last sync: Today, 08:32 AM</span>
        </div>
      </div>

      {/* B. Quick Actions Bar */}
      <section>
        <QuickActionsBar />
      </section>

      {/* C. Primary Wellness Score (Oura-inspired Gauge) */}
      {wellnessScore && (
        <section>
          <WellnessScoreGauge data={wellnessScore} />
        </section>
      )}

      {/* D. Speedometer-style Key Vitals & Gauges */}
      <section>
        <SpeedometerVitals measurements={measurements} />
      </section>

      {/* E. Longitudinal Trends & Analytics Chart */}
      <section>
        <AnalyticsTrendsChart />
      </section>

      {/* F. Today's Care Plan (Medications, Reminders & Consultations) */}
      <section>
        <TodayCarePlan />
      </section>

      <section>
        <PrescriptionIntelligenceCard />
      </section>

      {/* G. AI Health Insights */}
      <section>
        <AIInsightsStrip />
      </section>

      {/* H. Preventive Health Risk Overview */}
      <section>
        <HealthRiskGrid />
      </section>

      {/* I. Recent Health Activity Timeline */}
      <section>
        <RecentActivityTimeline />
      </section>

      {/* J. Explore More Tools Hub */}
      <section className="pt-2">
        <MoreToolsGrid />
      </section>
    </div>
  );
}
