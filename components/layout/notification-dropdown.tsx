"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, FileText, Calendar, Pill, AlertTriangle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { notificationsService } from "@/services/notificationsService";
import { AppNotification } from "@/types/notification";
import { formatRelativeTime } from "@/lib/formatters";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    notificationsService.getNotifications().then(setNotifications);
    const unsubscribe = notificationsService.subscribe(() => {
      notificationsService.getNotifications().then(setNotifications);
    });
    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    notificationsService.markAsRead(id);
  };

  const handleMarkAll = () => {
    notificationsService.markAllAsRead();
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "appointments":
        return <Calendar className="h-3.5 w-3.5 text-blue-600" />;
      case "reports":
        return <FileText className="h-3.5 w-3.5 text-sky-700" />;
      case "medications":
        return <Pill className="h-3.5 w-3.5 text-amber-700" />;
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-medium text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={`p-3 text-left transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${
                  !item.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 mt-0.5">
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className={`text-xs leading-tight truncate ${!item.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        onClick={() => setOpen(false)}
                        className="text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        {item.actionLabel || "View"} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

