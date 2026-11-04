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
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'due')
      .lte('next_due_date', now)
      .order('next_due_date', { ascending: true });

    if (error || !data) return [];
    return data as PreventiveCareRow[];
  }

  async findByStatus(userId: string, status: string): Promise<PreventiveCareRow[]> {
    return this.findByUserId(userId, {
      filters: { status },
      orderBy: { column: 'next_due_date', ascending: true },
    });
  }

  async findByCategory(userId: string, category: string): Promise<PreventiveCareRow[]> {
    return this.findByUserId(userId, {
      filters: { category },
      orderBy: { column: 'next_due_date', ascending: true },
    });
  }

  async findUpcoming(userId: string, days = 30): Promise<PreventiveCareRow[]> {
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const startDate = new Date().toISOString();

    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('next_due_date', startDate)
      .lte('next_due_date', endDate)
      .order('next_due_date', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as PreventiveCareRow[];
  }

  async markCompleted(careId: string, completedDate?: string): Promise<PreventiveCareRow | null> {
    const updates: PreventiveCareUpdate = {
      status: 'completed',
      last_completed_date: completedDate ?? new Date().toISOString().split('T')[0],
    };
    return this.update(careId, updates);
  }

  async updateNextDueDate(careId: string, nextDueDate: string): Promise<PreventiveCareRow | null> {
    return this.update(careId, {
      next_due_date: nextDueDate,
      status: 'due',
    } as PreventiveCareUpdate);
  }

  async snooze(careId: string, days: number): Promise<PreventiveCareRow | null> {
    const newDueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.updateNextDueDate(careId, newDueDate);
  }
}

export const preventiveCareRepository = new PreventiveCareRepository();