"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { symptomsService } from "@/services/symptomsService";
import { SymptomLog } from "@/types/symptom";
import { toast } from "sonner";

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState([3]);
  const [duration, setDuration] = useState("");
  const [triggers, setTriggers] = useState("");
  const [notes, setNotes] = useState("");

  const loadSymptoms = () => {
    symptomsService.getSymptoms().then(setSymptoms);
  };

  useEffect(() => {
    loadSymptoms();
    const unsub = symptomsService.subscribe(loadSymptoms);
    return unsub;
  }, []);

  const handleSaveSymptom = async () => {
    if (!name) {
      toast.error("Please enter symptom description");
      return;
    }
    const isEmergency = severity[0] >= 8 || name.toLowerCase().includes("chest pain");
    await symptomsService.addSymptom({
      symptomName: name,
      severity: severity[0],
      startDate: new Date().toISOString().split("T")[0],
      duration: duration || "Recent onset",
      frequency: "Intermittent",
      associatedSymptoms: [],
      possibleTriggers: triggers || "None recorded",
      notes: notes || undefined,
      isEmergencyAlert: isEmergency,
    });

    setModalOpen(false);
    setName("");
    setDuration("");
    setTriggers("");
    setNotes("");

    if (isEmergency) {
      toast.error("High severity logged. Please seek immediate urgent medical evaluation if experiencing acute distress.", {
        duration: 8000,
      });
    } else {
      toast.success("Symptom logged to timeline.");
    }
  };

  return (
    <PageShell
      title="Symptoms Journal & Timeline"
      description="Record symptom episodes, severity ratings (1 to 10), and potential environmental or dietary triggers."
      breadcrumbs={[{ label: "Symptoms Journal" }]}
      action={
        <Button onClick={() => setModalOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Log Symptom</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Urgent Care Emergency Banner */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold">Emergency & Urgent Care Guidance</h3>
            <p className="leading-relaxed">
              If you or someone around you experiences crushing chest pressure, sudden numbness or weakness on one side, severe shortness of breath, sudden speech difficulty, or severe allergic swelling, do not wait. <strong>Call local emergency services (e.g. 911 / 112) immediately.</strong> HealthBuddy does not diagnose acute medical emergencies.
            </p>
          </div>
        </div>

        {/* Symptoms Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900">
              Recorded Symptom History ({symptoms.length})
            </h3>
            <span className="text-xs text-slate-400">Chronological timeline</span>
          </div>

          <div className="space-y-3">
            {symptoms.map((sym) => (
              <div
                key={sym.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {sym.symptomName}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          sym.severity >= 7
                            ? "bg-rose-100 text-rose-800"
                            : sym.severity >= 4
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Severity {sym.severity} / 10
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Recorded on {sym.startDate} • {sym.duration}
                    </span>
                  </div>

                  <StatusBadge
                    status={sym.severity >= 7 ? "critical" : sym.severity >= 4 ? "borderline" : "normal"}
                    customLabel={sym.severity >= 7 ? "Severe" : sym.severity >= 4 ? "Moderate" : "Mild"}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-700 block">User-Entered Triggers:</span>
                    <span className="text-slate-600">{sym.possibleTriggers}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Outcome / Resolution:</span>
                    <span className="text-slate-600">{sym.notes || "Recorded in timeline"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Symptom</DialogTitle>
            <DialogDescription>
              Record an episode to assist your doctor during your next appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Symptom Description</Label>
              <Input
                placeholder="e.g. Frontal headache, joint ache, fatigue"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label>Severity Rating (1 to 10)</Label>
                <span className="text-xs font-bold text-teal-800 font-mono">
                  Level {severity[0]} / 10
                </span>
              </div>
              <Slider
                value={severity}
                onValueChange={setSeverity}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div>
              <Label className="mb-1 block">Duration</Label>
              <Input
                placeholder="e.g. 2 hours, intermittent all day"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Possible Triggers</Label>
              <Input
                placeholder="e.g. Long screen work, missed sleep, meal"
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Notes / Relief Measures</Label>
              <Input
                placeholder="e.g. Hydrated and rested; resolved after walk"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSymptom}>Save Symptom</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

