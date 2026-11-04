/**
 * Preventive Care Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type PreventiveCareRow = Database['public']['Tables']['preventive_care']['Row'];
type PreventiveCareInsert = Database['public']['Tables']['preventive_care']['Insert'];
type PreventiveCareUpdate = Database['public']['Tables']['preventive_care']['Update'];

export class PreventiveCareRepository extends BaseRepository<'preventive_care'> {
  constructor() {
    super('preventive_care');
  }

  async findDue(userId: string): Promise<PreventiveCareRow[]> {
    return this.findByUserId(userId, {
      filters: { status: 'Overdue' },
      orderBy: { column: 'due_date', ascending: true },
    });
  }

  async findByStatus(userId: string, status: PreventiveCareRow['status']): Promise<PreventiveCareRow[]> {
    return this.findByUserId(userId, {
      filters: { status },
      orderBy: { column: 'due_date', ascending: true },
    });
  }

  async findByCategory(userId: string, category: string): Promise<PreventiveCareRow[]> {
    return this.findByUserId(userId, {
      filters: { category },
      orderBy: { column: 'due_date', ascending: true },
    });
  }

  async findUpcoming(userId: string, days = 30): Promise<PreventiveCareRow[]> {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const startDate = new Date().toISOString().split('T')[0];

    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order('due_date', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as PreventiveCareRow[];
  }

  async markCompleted(careId: string, completedDate?: string): Promise<PreventiveCareRow | null> {
    const updates: PreventiveCareUpdate = {
      status: 'Up to date',
      last_completed_date: completedDate ?? new Date().toISOString().split('T')[0],
    };
    return this.update(careId, updates);
  }

  async updateDueDate(careId: string, dueDate: string): Promise<PreventiveCareRow | null> {
    return this.update(careId, {
      due_date: dueDate,
      status: 'Due soon',
    } as PreventiveCareUpdate);
  }

  async snooze(careId: string, days: number): Promise<PreventiveCareRow | null> {
    const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.updateDueDate(careId, newDueDate);
  }
}

export const preventiveCareRepository = new PreventiveCareRepository();