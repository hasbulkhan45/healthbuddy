"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Search,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { medicinesService } from "@/services/medicinesService";
import { Medication, MedicationReminder } from "@/types/medicine";
import { toast } from "sonner";

export default function MedicinesPage() {
  const [activeTab, setActiveTab] = useState("my_meds");
  const [medicines, setMedicines] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [strength, setStrength] = useState("");
  const [instructions, setInstructions] = useState("");

  const loadData = () => {
    medicinesService.getMedicines().then(setMedicines);
    medicinesService.getReminders().then(setReminders);
  };

  useEffect(() => {
    loadData();
    const unsub = medicinesService.subscribe(loadData);
    return unsub;
  }, []);

  const handleAddMedicine = async () => {
    if (!name) {
      toast.error("Please enter medicine name");
      return;
    }
    await medicinesService.addMedicine({
      name,
      activeIngredient: name,
      strength: strength || "Standard",
      dosageForm: "Tablet",
      userConfirmedInstructions: instructions || "Take as instructed",
      frequency: "Once daily",
      startDate: new Date().toISOString().split("T")[0],
      status: "Active",
      reminderEnabled: true,
      reminderTimes: ["08:30"],
    });

    setAddModalOpen(false);
    setName("");
    setStrength("");
    setInstructions("");
    toast.success("Medicine added with morning reminder schedule.");
  };

  const handleToggleReminder = async (id: string, currentStatus: string) => {
    const next = currentStatus === "completed" ? "pending" : "completed";
    await medicinesService.toggleReminder(id, next);
    toast.success(next === "completed" ? "Dose confirmed taken." : "Reminder reset.");
  };

  return (
    <PageShell
      title="Medications & Supplements"
      description="Personal medication schedule, active supplements, and confirmed prescribed instructions."
      breadcrumbs={[{ label: "Medicines" }]}
      action={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href="/medicines/interactions">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-700" />
              <span>Drug Interactions</span>
            </Link>
          </Button>
          <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Medicine</span>
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="my_meds">My Medicines ({medicines.filter((m) => m.status === "Active").length})</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="history">Medication History</TabsTrigger>
        </TabsList>

        {/* Tab 1: My Medicines */}
        <TabsContent value="my_meds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.filter((m) => m.status === "Active").map((med) => (
              <div
                key={med.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Pill className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{med.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">{med.strength}</p>
                      </div>
                    </div>
                    <StatusBadge status="completed" customLabel="Active" size="sm" />
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Instructions:</strong> {med.userConfirmedInstructions}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p>Frequency: {med.frequency}</p>
                    <p>Prescribed by: {med.prescribedBy || "Self-managed"}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Since {med.startDate}</span>
                  <Link
                    href={`/medicines/explorer?q=${encodeURIComponent(med.name)}`}
                    className="font-semibold text-teal-700 hover:underline"
                  >
                    Drug Info →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Schedule */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {reminders.map((rem) => {
              const isCompleted = rem.status === "completed";
              return (
                <div key={rem.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                      className="mt-0.5 text-slate-400 hover:text-teal-700"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4 className={`text-xs font-bold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {rem.medicationName} ({rem.strength})
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{rem.instructions}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{rem.scheduledTime}</span>
                    <Button
                      size="sm"
                      variant={isCompleted ? "outline" : "default"}
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                    >
                      {isCompleted ? "Mark Pending" : "Confirm Taken"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: History */}
        <TabsContent value="history" className="space-y-4">
          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {medicines.filter((m) => m.status === "Completed").map((med) => (
              <div key={med.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{med.name} ({med.strength})</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{med.userConfirmedInstructions}</p>
                </div>
                <StatusBadge status="normal" customLabel="Completed Course" size="sm" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medicine or Supplement</DialogTitle>
            <DialogDescription>
              Enter user-confirmed dosage and schedule instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="mb-1 block">Name</Label>
              <Input placeholder="e.g. Omega-3 Fish Oil" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Strength</Label>
              <Input placeholder="e.g. 1,000 mg" value={strength} onChange={(e) => setStrength(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Instructions</Label>
              <Input placeholder="e.g. 1 capsule with food in morning" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMedicine}>Save Medicine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

