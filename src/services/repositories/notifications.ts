/**
 * Notifications Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export class NotificationsRepository extends BaseRepository<'notifications'> {
  constructor() {
    super('notifications');
  }

  async findUnread(userId: string): Promise<NotificationRow[]> {
    return this.findByUserId(userId, {
      filters: { is_read: false },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findByType(userId: string, type: string): Promise<NotificationRow[]> {
    return this.findByUserId(userId, {
      filters: { type },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findRecent(userId: string, limit = 20): Promise<NotificationRow[]> {
    return this.findByUserId(userId, {
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }

  async markAsRead(notificationId: string): Promise<NotificationRow | null> {
    return this.update(notificationId, { is_read: true } as NotificationUpdate);
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    if (this.isDemoMode) return true;
    const supabase = this.getClient();

    const { error } = await supabase
      .from(this.tableName)
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return !error;
  }

  async createNotification(data: Omit<NotificationInsert, 'user_id'>, userId: string): Promise<NotificationRow | null> {
    return this.create({ ...data, user_id: userId } as NotificationInsert);
  }

  async deleteOldNotifications(userId: string, daysToKeep = 30): Promise<boolean> {
    if (this.isDemoMode) return true;
    const supabase = this.getClient();
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate);

    return !error;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.count(userId, { is_read: false });
  }
}

export const notificationsRepository = new NotificationsRepository();