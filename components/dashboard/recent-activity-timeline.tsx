"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Activity,
  Pill,
  AlertCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { notificationsService } from "@/services/notificationsService";
import { ActivityFeedItem } from "@/types/notification";

export function RecentActivityTimeline() {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);

  useEffect(() => {
    notificationsService.getActivityFeed().then(setActivities);
    const unsub = notificationsService.subscribe(() => {
      notificationsService.getActivityFeed().then(setActivities);
    });
    return unsub;
  }, []);

  const getIconBadge = (type: string) => {
    switch (type) {
      case "measurement":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-2xs">
            <Activity className="h-4 w-4" />
          </div>
        );
      case "report_upload":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-white shadow-2xs">
            <FileText className="h-4 w-4" />
          </div>
        );
      case "medicine":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-2xs">
            <Pill className="h-4 w-4" />
          </div>
        );
      case "symptom":
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-2xs">
            <AlertCircle className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-2xs">
            <Calendar className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Health Timeline
          </h2>
          <p className="text-xs text-slate-500">
            Chronological log of verified measurements, uploaded lab reports, and medication logs.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.slice(0, 5).map((act) => (
          <Link
            key={act.id}
            href={act.targetHref}
            className="flex items-start justify-between py-3 px-2 hover:bg-slate-50 rounded-xl transition-all group"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              {getIconBadge(act.type)}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                  {act.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {act.description}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-medium text-slate-400 shrink-0 pl-3 pt-1">
              {act.timestamp}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
