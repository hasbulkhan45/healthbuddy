"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Pill,
  ArrowRight,
  ListTodo,
} from "lucide-react";
import { careService } from "@/services/careService";
import { medicinesService } from "@/services/medicinesService";
import { MedicationReminder } from "@/types/medicine";
import { Appointment, FollowUpTask } from "@/types/care";
import { toast } from "sonner";

export function TodayCarePlan() {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);

  const loadData = () => {
    medicinesService.getReminders().then((rems) =>
      setReminders(rems.slice(0, 3))
    );
    careService.getAppointments().then((apts) =>
      setAppointments(apts.filter((a) => a.status === "Upcoming").slice(0, 1))
    );
    careService.getFollowUpTasks().then((t) => setTasks(t.slice(0, 3)));
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

  const handleToggleReminder = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await medicinesService.toggleReminder(id, newStatus);
    toast.success(
      newStatus === "completed"
        ? "Medication marked as completed."
        : "Reminder reset to pending."
    );
  };

  const handleToggleTask = async (id: string) => {
    await careService.toggleFollowUpTask(id);
    toast.success("Task updated.");
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Today&apos;s Care Schedule & Agenda
          </h2>
          <p className="text-xs text-slate-500">
            Turquoise medication reminders, blue appointments, and personal follow-up tasks.
          </p>
        </div>
        <Link
          href="/care"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group"
        >
          <span>Open Care Hub</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Medication Reminders (Turquoise Identity) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-100 text-teal-700">
                <Pill className="h-3 w-3" />
              </span>
              Medication Schedule
            </span>
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Turquoise Identity
            </span>
          </div>

          <div className="divide-y divide-teal-100/60 border border-teal-200/70 rounded-2xl overflow-hidden bg-gradient-to-b from-teal-50/20 to-white shadow-2xs">
            {reminders.map((rem) => {
              const isCompleted = rem.status === "completed";
              return (
                <div
                  key={rem.id}
                  className="flex items-center justify-between p-3.5 hover:bg-teal-50/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                      className="mt-0.5 text-teal-600 hover:text-teal-800 transition-colors shrink-0"
                      aria-label="Toggle complete"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-teal-300" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold truncate ${
                          isCompleted
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {rem.medicationName} ({rem.strength})
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {rem.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-teal-600" />
                      {rem.scheduledTime}
                    </span>
                    <button
                      onClick={() => handleToggleReminder(rem.id, rem.status)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all shadow-2xs ${
                        isCompleted
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          : "bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/20"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Take Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upcoming Appointment & Follow-up Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                <Calendar className="h-3 w-3" />
              </span>
              Upcoming Consultation & Tasks
            </span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Blue & Indigo
            </span>
          </div>

          {appointments.length > 0 && (
            <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 p-4 flex items-start justify-between gap-3 shadow-2xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                  Confirmed Visit
                </span>
                <p className="text-xs font-bold text-slate-900 pt-0.5">
                  {appointments[0].doctorName}
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  {appointments[0].specialty} • {appointments[0].date} at {appointments[0].time}
                </p>
                <p className="text-[11px] text-slate-500">
                  {appointments[0].purpose}
                </p>
              </div>
              <Link
                href="/doctor-summary"
                className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Prep Brief
              </Link>
            </div>
          )}

          {/* Follow-up tasks checklist */}
          <div className="divide-y divide-indigo-100/60 border border-indigo-200/70 rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-50/20 to-white shadow-2xs">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTask(t.id)}
                className="flex items-center justify-between p-3 hover:bg-indigo-50/40 transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {t.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-indigo-300 shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      t.isCompleted
                        ? "text-slate-400 line-through"
                        : "font-bold text-slate-800"
                    }`}
                  >
                    {t.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 pl-2 font-mono">
                  Due {t.dueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
