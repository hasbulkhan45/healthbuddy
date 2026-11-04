"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Heart,
  Droplets,
  Wind,
  Scale,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { healthService } from "@/services/healthService";
import { HealthMeasurement } from "@/types/health";
import { toast } from "sonner";

export default function HealthOverviewPage() {
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [metricType, setMetricType] = useState("blood_pressure");
  const [val1, setVal1] = useState("120");
  const [val2, setVal2] = useState("80");
  const [notes, setNotes] = useState("");

  const loadData = () => {
    healthService.getMeasurements().then(setMeasurements);
  };

  useEffect(() => {
    loadData();
    const unsub = healthService.subscribe(loadData);
    return unsub;
  }, []);

  const handleSave = async () => {
    let unit = "mmHg";
    let formatted = `${val1}/${val2}`;
    let n1 = parseFloat(val1) || 120;
    let n2 = parseFloat(val2) || 80;

    if (metricType === "heart_rate") {
      unit = "bpm";
      formatted = val1;
      n2 = undefined as any;
    } else if (metricType === "blood_glucose") {
      unit = "mg/dL";
      formatted = val1;
      n2 = undefined as any;
    } else if (metricType === "weight") {
      unit = "kg";
      formatted = val1;
      n2 = undefined as any;
    } else if (metricType === "spo2") {
      unit = "%";
      formatted = val1;
      n2 = undefined as any;
    }

    await healthService.addMeasurement({
      metricType: metricType as any,
      value: n1,
      secondaryValue: n2,
      formattedValue: formatted,
      unit,
      status: "normal",
      statusLabel: "Optimal",
      source: "Manual entry",
      notes: notes || "Recorded via Health Overview",
    });

    setModalOpen(false);
    toast.success("Measurement recorded.");
  };

  const handleDelete = async (id: string) => {
    await healthService.deleteMeasurement(id);
    toast.success("Measurement removed.");
  };

  return (
    <PageShell
      title="Health Overview & Vitals Log"
      description="Comprehensive vital measurements, historical records, and clinical baseline tracking."
      breadcrumbs={[{ label: "Health Overview" }]}
      action={
        <Button onClick={() => setModalOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Measurement</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Vitals Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {measurements.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {m.metricType.replace(/_/g, " ")}
                </span>
                <StatusBadge status={m.status} customLabel={m.statusLabel} size="sm" />
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-slate-900">
                  {m.formattedValue}
                </span>
                <span className="text-xs font-semibold text-slate-500">{m.unit}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Ref: {m.referenceRange || "Standard"}</span>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="hover:text-rose-600 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed History Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">
              Measurement History Log
            </h3>
            <span className="text-xs text-slate-400">
              {measurements.length} entries recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Metric</th>
                  <th className="py-2.5 px-4">Value</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Recorded At</th>
                  <th className="py-2.5 px-4">Source</th>
                  <th className="py-2.5 px-4">Notes</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-900 uppercase text-[11px]">
                      {m.metricType.replace(/_/g, " ")}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {m.formattedValue} {m.unit}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusBadge status={m.status} customLabel={m.statusLabel} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                      {m.recordedAt.split("T")[0]}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{m.source}</td>
                    <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{m.notes || "—"}</td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Measurement</DialogTitle>
            <DialogDescription>
              Record a new physiological reading with contextual notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Metric</Label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood_pressure">Blood Pressure (mmHg)</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate (bpm)</SelectItem>
                  <SelectItem value="blood_glucose">Blood Glucose (mg/dL)</SelectItem>
                  <SelectItem value="weight">Body Weight (kg)</SelectItem>
                  <SelectItem value="spo2">Blood Oxygen SpO2 (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {metricType === "blood_pressure" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block">Systolic (mmHg)</Label>
                  <Input value={val1} onChange={(e) => setVal1(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block">Diastolic (mmHg)</Label>
                  <Input value={val2} onChange={(e) => setVal2(e.target.value)} />
                </div>
              </div>
            ) : (
              <div>
                <Label className="mb-1 block">Value</Label>
                <Input value={val1} onChange={(e) => setVal1(e.target.value)} />
              </div>
            )}
            <div>
              <Label className="mb-1 block">Contextual Notes</Label>
              <Input
                placeholder="e.g. Seated 5 minutes, morning fasting"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

