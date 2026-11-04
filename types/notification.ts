export type NotificationCategory =
  | "reports"
  | "appointments"
  | "medications"
  | "health"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ActivityFeedItem {
  id: string;
  type: "report_upload" | "measurement" | "medicine" | "symptom" | "appointment";
  title: string;
  description: string;
  timestamp: string;
  targetHref: string;
}

