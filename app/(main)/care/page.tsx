"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Pill,
  ShieldCheck,
  MapPin,
  Trash2,
  Edit,
  ArrowRight,
  Video,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { careService } from "@/services/careService";
import { medicinesService } from "@/services/medicinesService";
import { Appointment, PreventiveCareItem, FollowUpTask } from "@/types/care";
import { MedicationReminder } from "@/types/medicine";
import { toast } from "sonner";

export default function CarePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [preventiveItems, setPreventiveItems] = useState<PreventiveCareItem[]>([]);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);

  // Modals
  const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinic, setClinic] = useState("");
  const [aptDate, setAptDate] = useState("");
  const [aptTime, setAptTime] = useState("");
  const [aptPurpose, setAptPurpose] = useState("");
  const [locationType, setLocationType] = useState<"In-person" | "Video consultation">("In-person");

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const loadData = () => {
    careService.getAppointments().then(setAppointments);
    medicinesService.getReminders().then(setReminders);
    careService.getPreventiveCare().then(setPreventiveItems);
    careService.getFollowUpTasks().then(setTasks);
  };

  useEffect(() => {
    loadData();
    const unsubCare = careService.subscribe(loadData);
    const unsubMeds = medicinesService.subscribe(loadData);
    return () => {
      unsubCare();
      unsubMeds();
    };
  }, []);

  const handleCreateAppointment = async () => {
    if (!doctorName || !aptDate) {
      toast.error("Please enter doctor name and date");
      return;
    }
    await careService.addAppointment({
      doctorName,
      specialty: specialty || "General Medicine",
      clinicOrHospital: clinic || "Medical Care Center",
      date: aptDate,
      time: aptTime || "10:00 AM",
      purpose: aptPurpose || "Routine Consultation",
      status: "Upcoming",
      locationType,
    });
    setAddAppointmentOpen(false);
    setDoctorName("");
    setAptPurpose("");
    toast.success("Appointment scheduled successfully!");
  };

  const handleDeleteAppointment = async (id: string) => {
    await careService.deleteAppointment(id);
    toast.success("Appointment removed.");
  };

  const handleToggleReminder = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    await medicinesService.toggleReminder(id, nextStatus);
    toast.success(nextStatus === "completed" ? "Medication confirmed completed." : "Reminder pending.");
  };

  const handleToggleTask = async (id: string) => {
    await careService.toggleFollowUpTask(id);
    toast.success("Task status updated.");
  };

  const handleCreateTask = async () => {
    if (!taskTitle) {
      toast.error("Please enter task title");
      return;
    }
    await careService.addFollowUpTask({
      title: taskTitle,
      category: "Doctor follow-up",
      dueDate: taskDueDate || new Date().toISOString().split("T")[0],
      isCompleted: false,
      priority: "normal",
    });
    setAddTaskOpen(false);
    setTaskTitle("");
    toast.success("Follow-up task added.");
  };

  return (
    <PageShell
      title="Care Management Hub"
      description="Track upcoming appointments, daily medication schedules, preventive screenings, and clinical tasks."
      action={
        <Button onClick={() => setAddAppointmentOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Appointment</span>
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
          <TabsTrigger value="overview">Care Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
          <TabsTrigger value="medications">Medication Reminders</TabsTrigger>
          <TabsTrigger value="preventive">Preventive Care</TabsTrigger>
          <TabsTrigger value="followups">Follow-up Tasks</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Next Appointment
              </span>
              <p className="text-base font-bold text-slate-900">
                {appointments[0]?.doctorName || "None scheduled"}
              </p>
              <p className="text-xs text-slate-500">
                {appointments[0]?.date} • {appointments[0]?.time}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Pending Today
              </span>
              <p className="text-base font-bold text-slate-900">
                {reminders.filter((r) => r.status === "pending").length} Medication Reminders
              </p>
              <p className="text-xs text-slate-500">
                Morning doses scheduled
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Preventive Health
              </span>
              <p className="text-base font-bold text-slate-900">
                {preventiveItems.filter((p) => p.status === "Due soon").length} Items Due Soon
              </p>
              <p className="text-xs text-slate-500">
                Routine dental & screening
              </p>
            </div>
          </div>

          {/* Appointments Preview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Upcoming Doctor Consultations
              </h3>
              <button
                onClick={() => setActiveTab("appointments")}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 2).map((apt) => (
                <div key={apt.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {apt.doctorName}
                      </span>
                      <StatusBadge
                        status={apt.status === "Upcoming" ? "upcoming" : "completed"}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {apt.specialty} • {apt.clinicOrHospital}
                    </p>
                    <p className="text-xs text-slate-700 font-medium">
                      {apt.purpose}
                    </p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="font-mono font-bold text-slate-800 block">
                      {apt.date}
                    </span>
                    <span className="text-slate-400">{apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Appointments */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {apt.doctorName}
                      </h3>
                      <p className="text-xs text-slate-500">{apt.specialty}</p>
                    </div>
                    <StatusBadge
                      status={apt.status === "Upcoming" ? "upcoming" : "completed"}
                      size="sm"
                    />
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-teal-700" />
                      <span className="font-mono">{apt.date} at {apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.locationType === "Video consultation" ? (
                        <Video className="h-3.5 w-3.5 text-sky-700" />
                      ) : (
                        <MapPin className="h-3.5 w-3.5 text-rose-700" />
                      )}
                      <span>{apt.clinicOrHospital}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Purpose:</strong> {apt.purpose}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleDeleteAppointment(apt.id)}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/doctor-summary">Prepare Visit Brief</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Medication Reminders */}
        <TabsContent value="medications" className="space-y-4">
          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {reminders.map((rem) => {
              const isCompleted = rem.status === "completed";
              return (
                <div
                  key={rem.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                      className="mt-1 text-slate-400 hover:text-teal-700 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCompleted ? "line-through text-slate-400" : "text-slate-900"
                        }`}
                      >
                        {rem.medicationName} — {rem.strength}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rem.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {rem.scheduledTime}
                    </span>
                    <Button
                      size="sm"
                      variant={isCompleted ? "outline" : "default"}
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                    >
                      {isCompleted ? "Mark Pending" : "Mark Taken"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 4: Preventive Care */}
        <TabsContent value="preventive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {preventiveItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {item.category}
                  </span>
                  <StatusBadge
                    status={item.status === "Up to date" ? "completed" : "borderline"}
                    customLabel={item.status}
                    size="sm"
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <strong>Clinical context:</strong> {item.importanceExplanation}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Tab 5: Follow-ups */}
        <TabsContent value="followups" className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-600">
              Personal Healthcare Action Items
            </span>
            <Button size="sm" onClick={() => setAddTaskOpen(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </Button>
          </div>

          <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      task.isCompleted
                        ? "line-through text-slate-400"
                        : "font-semibold text-slate-800"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Due: {task.dueDate}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Appointment Modal */}
      <Dialog open={addAppointmentOpen} onOpenChange={setAddAppointmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Doctor Consultation</DialogTitle>
            <DialogDescription>
              Record an upcoming consultation to generate preparation summaries and reminders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <Label className="mb-1 block">Physician / Doctor Name</Label>
              <Input
                placeholder="e.g. Dr. Sarah Jenkins, MD"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Specialty</Label>
              <Input
                placeholder="e.g. Preventive Cardiology, Primary Care"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Date</Label>
                <Input
                  type="date"
                  value={aptDate}
                  onChange={(e) => setAptDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block">Time</Label>
                <Input
                  placeholder="e.g. 10:30 AM"
                  value={aptTime}
                  onChange={(e) => setAptTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Clinic or Location</Label>
              <Input
                placeholder="e.g. Pacific Heart & Vascular Institute"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Appointment Purpose / Notes</Label>
              <Input
                placeholder="e.g. 6-month lipid panel follow-up review"
                value={aptPurpose}
                onChange={(e) => setAptPurpose(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAppointmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment}>Save Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Follow-Up Task</DialogTitle>
            <DialogDescription>
              Create a personalized health or doctor follow-up checklist item.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="mb-1 block">Task Description</Label>
              <Input
                placeholder="e.g. Schedule dental cleaning"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1 block">Due Date</Label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

