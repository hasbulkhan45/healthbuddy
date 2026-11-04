/**
 * Follow Up Tasks Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type FollowUpTaskRow = Database['public']['Tables']['follow_up_tasks']['Row'];
type FollowUpTaskInsert = Database['public']['Tables']['follow_up_tasks']['Insert'];
type FollowUpTaskUpdate = Database['public']['Tables']['follow_up_tasks']['Update'];

export class FollowUpTasksRepository extends BaseRepository<'follow_up_tasks'> {
  constructor() {
    super('follow_up_tasks');
  }

  async findPending(userId: string): Promise<FollowUpTaskRow[]> {
    return this.findByUserId(userId, {
      filters: { status: 'pending' },
      orderBy: { column: 'due_date', ascending: true },
    });
  }

  async findOverdue(userId: string): Promise<FollowUpTaskRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lt('due_date', now)
      .order('due_date', { ascending: true });

    if (error || !data) return [];
    return data as FollowUpTaskRow[];
  }

  async findByPriority(userId: string, priority: string): Promise<FollowUpTaskRow[]> {
    return this.findByUserId(userId, {
      filters: { priority },
      orderBy: { column: 'due_date', ascending: true },
    });
  }

  async findBySource(userId: string, sourceType: string): Promise<FollowUpTaskRow[]> {
    return this.findByUserId(userId, {
      filters: { source_type: sourceType },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findUpcoming(userId: string, days = 7): Promise<FollowUpTaskRow[]> {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const startDate = new Date().toISOString();

    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as FollowUpTaskRow[];
  }

  async completeTask(taskId: string): Promise<FollowUpTaskRow | null> {
    return this.update(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    } as FollowUpTaskUpdate);
  }

  async updateStatus(taskId: string, status: FollowUpTaskRow['status']): Promise<FollowUpTaskRow | null> {
    const updates: FollowUpTaskUpdate = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    return this.update(taskId, updates);
  }
}

export const followUpTasksRepository = new FollowUpTasksRepository();