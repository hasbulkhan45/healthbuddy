import { mockStore } from "./mockStore";
import { AppNotification, ActivityFeedItem } from "@/types/notification";

export const notificationsService = {
  async getNotifications(): Promise<AppNotification[]> {
    return mockStore.getNotifications();
  },

  async markAsRead(id: string): Promise<AppNotification | undefined> {
    return mockStore.markNotificationAsRead(id);
  },

  async markAllAsRead(): Promise<boolean> {
    return mockStore.markAllNotificationsAsRead();
  },

  async getActivityFeed(): Promise<ActivityFeedItem[]> {
    return mockStore.getActivities();
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

