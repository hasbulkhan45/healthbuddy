"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  PlusCircle,
  AlertCircle,
  Pill,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { healthService } from "@/services/healthService";
import { symptomsService } from "@/services/symptomsService";
import { medicinesService } from "@/services/medicinesService";
import { reportsService } from "@/services/reportsService";
import { toast } from "sonner";

export function QuickActionsBar() {
  const router = useRouter();

  // Modals state
  const [measurementModalOpen, setMeasurementModalOpen] = useState(false);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form states
  const [metricType, setMetricType] = useState<string>("blood_pressure");
  const [metricValue, setMetricValue] = useState("120");
  const [secondaryValue, setSecondaryValue] = useState("80");
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState([3]);
  const [symptomTriggers, setSymptomTriggers] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [medicineStrength, setMedicineStrength] = useState("");
  const [medicineInstructions, setMedicineInstructions] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveMeasurement = async () => {
    let unit = "mmHg";
    let formatted = `${metricValue}/${secondaryValue}`;
    let numVal = parseFloat(metricValue) || 120;
    let secVal = parseFloat(secondaryValue) || 80;

    if (metricType === "heart_rate") {
      unit = "bpm";
      formatted = metricValue;
      secVal = undefined as any;
    } else if (metricType === "blood_glucose") {
      unit = "mg/dL";
      formatted = metricValue;
      secVal = undefined as any;
    } else if (metricType === "weight") {
      unit = "kg";
      formatted = metricValue;
      secVal = undefined as any;
    } else if (metricType === "spo2") {
      unit = "%";
      formatted = metricValue;
      secVal = undefined as any;
    }

    await healthService.addMeasurement({
      metricType: metricType as any,
      value: numVal,
      secondaryValue: secVal,
      formattedValue: formatted,
      unit,
      status: "normal",
      statusLabel: "Recorded",
      source: "Manual entry",
      notes: "Logged via Quick Actions",
    });

    toast.success(`${metricType.replace(/_/g, " ")} recorded successfully!`);
    setMeasurementModalOpen(false);
  };

  const handleSaveSymptom = async () => {
    if (!symptomName) {
      toast.error("Please enter a symptom name");
      return;
    }
    const isEmergency = severity[0] >= 8 || symptomName.toLowerCase().includes("chest pain");
    await symptomsService.addSymptom({
      symptomName,
      severity: severity[0],
      startDate: new Date().toISOString().split("T")[0],
      duration: "Recent onset",
      frequency: "Intermittent",
      associatedSymptoms: [],
      possibleTriggers: symptomTriggers || "None specified",
      isEmergencyAlert: isEmergency,
    });

    if (isEmergency) {
      toast.error("High severity symptom logged. If experiencing medical distress, please seek emergency care immediately.", {
        duration: 8000,
      });
    } else {
      toast.success("Symptom logged to journal.");
    }
    setSymptomModalOpen(false);
    setSymptomName("");
  };

  const handleSaveMedicine = async () => {
    if (!medicineName) {
      toast.error("Please enter medicine name");
      return;
    }
    await medicinesService.addMedicine({
      name: medicineName,
      activeIngredient: medicineName,
      strength: medicineStrength || "Standard",
      dosageForm: "Tablet",
      userConfirmedInstructions: medicineInstructions || "Take as instructed",
      frequency: "Once daily",
      startDate: new Date().toISOString().split("T")[0],
      status: "Active",
      reminderEnabled: true,
      reminderTimes: ["08:30"],
    });

    toast.success("Medicine added with active morning reminder.");
    setMedicineModalOpen(false);
    setMedicineName("");
  };

  const handleUploadReport = async () => {
    if (!reportTitle) {
      toast.error("Please enter report title");
      return;
    }
    setIsUploading(true);
    setUploadProgress(25);
    setTimeout(() => setUploadProgress(70), 300);
    setTimeout(async () => {
      setUploadProgress(100);
      await reportsService.uploadReport(
        { name: `${reportTitle}.pdf`, size: 1024 * 1024 * 1.2, type: "application/pdf" },
        {
          title: reportTitle,
          category: "lab_report",
          institutionName: "Diagnostic Laboratory Center",
          documentDate: new Date().toISOString().split("T")[0],
        }
      );
      setIsUploading(false);
      setUploadModalOpen(false);
      setReportTitle("");
      setUploadProgress(0);
      toast.success("Report uploaded and simulated lab values extracted!");
    }, 800);
  };

  const actions = [
    {
      label: "Upload Report",
      icon: UploadCloud,
      onClick: () => setUploadModalOpen(true),
      gradient: "from-blue-600 to-indigo-600 shadow-blue-500/25",
      borderHover: "hover:border-blue-300 hover:bg-blue-50/40",
    },
    {
      label: "Add Measurement",
      icon: PlusCircle,
      onClick: () => setMeasurementModalOpen(true),
      gradient: "from-cyan-500 to-teal-600 shadow-cyan-500/25",
      borderHover: "hover:border-cyan-300 hover:bg-cyan-50/40",
    },
    {
      label: "Log Symptom",
      icon: AlertCircle,
      onClick: () => setSymptomModalOpen(true),
      gradient: "from-rose-500 to-pink-600 shadow-rose-500/25",
      borderHover: "hover:border-pink-300 hover:bg-pink-50/40",
    },
    {
      label: "Add Medicine",
      icon: Pill,
      onClick: () => setMedicineModalOpen(true),
      gradient: "from-amber-500 to-orange-600 shadow-amber-500/25",
      borderHover: "hover:border-orange-300 hover:bg-orange-50/40",
    },
    {
      label: "Ask AI",
      icon: Sparkles,
      onClick: () => router.push("/ai-buddy"),
      gradient: "from-indigo-600 via-purple-600 to-pink-600 shadow-purple-500/30",
      borderHover: "hover:border-purple-300 hover:bg-purple-50/40",
      accent: true,
    },
    {
      label: "Upload Prescription",
      icon: UploadCloud,
      onClick: () => router.push("/prescriptions/upload"),
      gradient: "from-violet-600 to-indigo-600 shadow-violet-500/25",
      borderHover: "hover:border-violet-300 hover:bg-violet-50/40",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={act.onClick}
              className={`flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 text-left text-xs font-bold text-slate-800 shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 ${act.borderHover} active:scale-[0.98] group`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${act.gradient} text-white shadow-sm transition-transform group-hover:scale-105`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Measurement Modal */}
      <Dialog open={measurementModalOpen} onOpenChange={setMeasurementModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Health Measurement</DialogTitle>
            <DialogDescription>
              Record a new reading to update your health score and trends.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Metric Type</Label>
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
                  <Input
                    type="number"
                    value={metricValue}
                    onChange={(e) => setMetricValue(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Diastolic (mmHg)</Label>
                  <Input
                    type="number"
                    value={secondaryValue}
                    onChange={(e) => setSecondaryValue(e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="mb-1 block">Value</Label>
                <Input
                  type="number"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="e.g. 72"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeasurementModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeasurement}>Save Measurement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Symptom Modal */}
      <Dialog open={symptomModalOpen} onOpenChange={setSymptomModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Symptom</DialogTitle>
            <DialogDescription>
              Track symptoms to identify potential lifestyle or environmental triggers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1 block">Symptom Description</Label>
              <Input
                value={symptomName}
                onChange={(e) => setSymptomName(e.target.value)}
                placeholder="e.g. Tension headache, nasal congestion"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <Label>Severity Rating (1 to 10)</Label>
                <span className="text-xs font-bold text-rose-700">
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
              {severity[0] >= 8 && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">
                  Notice: Severe ratings suggest consulting urgent medical evaluation.
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1 block">Possible Triggers / Context</Label>
              <Input
                value={symptomTriggers}
                onChange={(e) => setSymptomTriggers(e.target.value)}
                placeholder="e.g. Long screen hours, poor sleep, pollen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSymptomModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSymptom}>Save to Journal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medicine Modal */}
      <Dialog open={medicineModalOpen} onOpenChange={setMedicineModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medicine or Supplement</DialogTitle>
            <DialogDescription>
              Record user-confirmed prescribed instructions and reminder schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Medication Name</Label>
              <Input
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Vitamin D3, Metformin"
              />
            </div>
            <div>
              <Label className="mb-1 block">Strength / Dose</Label>
              <Input
                value={medicineStrength}
                onChange={(e) => setMedicineStrength(e.target.value)}
                placeholder="e.g. 2,000 IU or 500 mg"
              />
            </div>
            <div>
              <Label className="mb-1 block">Prescribed Instructions</Label>
              <Input
                value={medicineInstructions}
                onChange={(e) => setMedicineInstructions(e.target.value)}
                placeholder="e.g. Take 1 tablet in the morning after breakfast"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMedicineModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMedicine}>Save Medicine</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Report Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Medical Document</DialogTitle>
            <DialogDescription>
              Select a PDF, JPG, or PNG lab report to simulate data extraction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1 block">Report Title</Label>
              <Input
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Annual Metabolic Panel 2026"
              />
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
              <UploadCloud className="mx-auto h-8 w-8 text-blue-500 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Drag and drop your document here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports PDF, JPG, PNG (Local simulated upload)
              </p>
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Extracting lab values...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUploading}
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isUploading} onClick={handleUploadReport}>
              {isUploading ? "Processing..." : "Start Simulated Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
