"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Heart,
  ShieldCheck,
  Lock,
  Trash2,
  Plus,
  Save,
  AlertTriangle,
  Download,
  Info,
  Check,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { profileService } from "@/services/profileService";
import { UserProfile, AllergyItem } from "@/types/user";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [activeTab, setActiveTab] = useState("personal");

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<string>("O+");
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(68.5);

  // Allergies modal
  const [allergyModalOpen, setAllergyModalOpen] = useState(false);
  const [allergenName, setAllergenName] = useState("");
  const [allergyType, setAllergyType] = useState<"Medication" | "Food" | "Environmental">("Medication");
  const [allergyReaction, setAllergyReaction] = useState("");

  const loadData = () => {
    profileService.getProfile().then((p) => {
      setProfile(p);
      setFullName(p.fullName);
      setEmail(p.email);
      setPhone(p.phone);
      setBloodGroup(p.bloodGroup);
      setHeightCm(p.healthProfile.heightCm);
      setWeightKg(p.healthProfile.weightKg);
    });
    profileService.getAllergies().then(setAllergies);
  };

  useEffect(() => {
    loadData();
    const unsub = profileService.subscribe(loadData);
    return unsub;
  }, []);

  const handleSavePersonal = async () => {
    if (!profile) return;
    await profileService.updateProfile({
      fullName,
      email,
      phone,
      bloodGroup: bloodGroup as any,
    });
    toast.success("Personal information updated.");
  };

  const handleSaveHealthProfile = async () => {
    if (!profile) return;
    const heightM = heightCm / 100;
    const calculatedBmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    await profileService.updateProfile({
      healthProfile: {
        ...profile.healthProfile,
        heightCm,
        weightKg,
        bmi: calculatedBmi,
      },
    });
    toast.success("Health measurements updated.");
  };

  const handleToggleAIPermission = async (key: string, value: boolean) => {
    if (!profile) return;
    await profileService.updateProfile({
      aiPermissions: {
        ...profile.aiPermissions,
        [key]: value,
      },
    });
    toast.success("AI permission updated.");
  };

  const handleAddAllergy = async () => {
    if (!allergenName) {
      toast.error("Please enter allergen name");
      return;
    }
    await profileService.addAllergy({
      allergen: allergenName,
      type: allergyType,
      severity: "Moderate",
      reaction: allergyReaction || "Recorded reaction",
    });
    setAllergyModalOpen(false);
    setAllergenName("");
    setAllergyReaction("");
    toast.success("Allergy record added.");
  };

  const handleDeleteAllergy = async (id: string) => {
    await profileService.deleteAllergy(id);
    toast.success("Allergy item deleted.");
  };

  if (!profile) return null;

  return (
    <PageShell
      title="Profile & Settings"
      description="Manage your personal healthcare data, emergency records, allergies, and AI data permissions."
      headerBg="gradient"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="personal" className="px-3 py-1.5">Personal Info</TabsTrigger>
          <TabsTrigger value="health" className="px-3 py-1.5">Health Profile</TabsTrigger>
          <TabsTrigger value="allergies" className="px-3 py-1.5">Allergies ({allergies.length})</TabsTrigger>
          <TabsTrigger value="lifestyle" className="px-3 py-1.5">Lifestyle</TabsTrigger>
          <TabsTrigger value="ai_permissions" className="px-3 py-1.5">AI Permissions</TabsTrigger>
          <TabsTrigger value="privacy" className="px-3 py-1.5">Privacy & Security</TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Info */}
        <TabsContent value="personal" className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-blue p-6 shadow-xs max-w-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Date of Birth</Label>
                <Input value={profile.dateOfBirth} disabled className="bg-slate-50 text-slate-500 font-mono" />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Age: {profile.age} years</span>
              </div>
              <div>
                <Label className="mb-1 block">Email Address</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label className="mb-1 block">Blood Group</Label>
                <Select value={bloodGroup} onValueChange={setBloodGroup}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Biological Sex</Label>
                <Input value={profile.sex} disabled className="bg-slate-50 text-slate-500" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSavePersonal} size="sm" className="gap-1.5 badge-gradient-blue-indigo">
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Health Profile */}
        <TabsContent value="health" className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-teal p-6 shadow-xs max-w-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Biometrics & Clinical Background
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block">Height (cm)</Label>
                <Input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-1 block">Weight (kg)</Label>
                <Input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Calculated Body Mass Index (BMI)</span>
                <span className="text-lg font-bold font-mono text-teal-800">
                  {profile.healthProfile.bmi} kg/m²
                </span>
              </div>
              <StatusBadge status="normal" customLabel="Normal Healthy Range" size="sm" />
            </div>

            <div className="space-y-2 pt-2">
              <Label className="block">Existing Medical Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {profile.healthProfile.existingConditions.map((c, i) => (
                  <span key={i} className="text-xs font-medium bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label className="block">Known Family History</Label>
              <div className="flex flex-wrap gap-2">
                {profile.healthProfile.familyHistory.map((f, i) => (
                  <span key={i} className="text-xs font-medium bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200/60">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button onClick={handleSaveHealthProfile} size="sm" className="gap-1.5 badge-gradient-teal-cyan">
                <Save className="h-3.5 w-3.5" />
                <span>Save Biometrics</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Allergies */}
        <TabsContent value="allergies" className="space-y-4">
          <div className="max-w-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">
                Documented Adverse Reactions & Allergies
              </span>
              <Button size="sm" onClick={() => setAllergyModalOpen(true)} className="gap-1.5 badge-gradient-rose-pink">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Allergy Record</span>
              </Button>
            </div>

            <div className="border border-slate-200/80 rounded-xl card-vibrant-rose overflow-hidden shadow-xs divide-y divide-slate-100">
              {allergies.map((alg) => (
                <div key={alg.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{alg.allergen}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                        {alg.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {alg.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Reaction: {alg.reaction}
                    </p>
                    {alg.notes && (
                      <p className="text-[11px] text-slate-500">{alg.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAllergy(alg.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete allergy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Lifestyle */}
        <TabsContent value="lifestyle" className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-emerald p-6 shadow-xs max-w-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Lifestyle Habits & Environmental Factors
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <Label className="mb-1 block">Physical Activity</Label>
                <Input value={profile.lifestyle.activityLevel} disabled className="bg-slate-50" />
              </div>
              <div>
                <Label className="mb-1 block">Average Sleep Duration</Label>
                <Input value={`${profile.lifestyle.sleepAverageHours} hours/night`} disabled className="bg-slate-50" />
              </div>
              <div>
                <Label className="mb-1 block">Dietary Pattern</Label>
                <Input value={profile.lifestyle.dietType} disabled className="bg-slate-50" />
              </div>
              <div>
                <Label className="mb-1 block">Tobacco / Smoking</Label>
                <Input value={profile.lifestyle.smokingStatus} disabled className="bg-slate-50" />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: AI Permissions */}
        <TabsContent value="ai_permissions" className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-indigo p-6 shadow-xs max-w-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                AI Data Processing Permissions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant or restrict which personal health categories AI Buddy is authorized to read.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {[
                { key: "allowMedicalReports", label: "Medical & Laboratory Reports", desc: "Allows extraction summaries of blood and imaging tests" },
                { key: "allowMedicines", label: "Prescription & Supplement List", desc: "Enables medication scheduling context and drug interaction references" },
                { key: "allowSymptoms", label: "Symptoms Journal", desc: "Allows correlation between recorded symptoms and lifestyle logs" },
                { key: "allowHealthMeasurements", label: "Health Measurements (Vitals)", desc: "Enables BP, heart rate, and glucose trend analysis" },
                { key: "allowHealthProfile", label: "General Health Profile", desc: "Includes age, BMI, allergies, and family history" },
              ].map((item) => (
                <div key={item.key} className="p-3.5 flex items-center justify-between hover:bg-indigo-50/50">
                  <div className="pr-4">
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <Switch
                    checked={(profile.aiPermissions as any)[item.key]}
                    onCheckedChange={(checked) => handleToggleAIPermission(item.key, checked)}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-3 text-[11px] text-teal-800 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                All AI processing is private to your account. In production, these authorization flags are passed securely to backend services.
              </span>
            </div>
          </div>
        </TabsContent>

        {/* Tab 6: Privacy & Security */}
        <TabsContent value="privacy" className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 card-vibrant-violet p-6 shadow-xs max-w-2xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Privacy, Export & Account Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstration placeholders for future data portability and session management.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Export All Health Data</h4>
                  <p className="text-[11px] text-slate-500">
                    Download a complete JSON export of all logged vitals, reports, and appointments.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("HealthBuddy data export downloaded (demo).")}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Local Data Retention</h4>
                  <p className="text-[11px] text-slate-500">
                    Clear local storage cache and reset mock database to defaults.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    localStorage.clear();
                    toast.success("Cache cleared. Refresh page to reset.");
                  }}
                >
                  Reset Demo
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Allergy Modal */}
      <Dialog open={allergyModalOpen} onOpenChange={setAllergyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Allergy Record</DialogTitle>
            <DialogDescription>
              Document an allergy or adverse reaction to alert clinicians and AI Buddy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Allergen Name</Label>
              <Input
                placeholder="e.g. Penicillin, Peanuts, Latex"
                value={allergenName}
                onChange={(e) => setAllergenName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Category</Label>
              <Select value={allergyType} onValueChange={(v: any) => setAllergyType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Reaction Description</Label>
              <Input
                placeholder="e.g. Hives, facial swelling, sneezing"
                value={allergyReaction}
                onChange={(e) => setAllergyReaction(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllergyModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAllergy} className="badge-gradient-rose-pink">
              Save Allergy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}