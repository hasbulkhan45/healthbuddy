/**
 * Symptoms Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type SymptomRow = Database['public']['Tables']['symptoms']['Row'];
type SymptomInsert = Database['public']['Tables']['symptoms']['Insert'];
type SymptomUpdate = Database['public']['Tables']['symptoms']['Update'];

export class SymptomsRepository extends BaseRepository<'symptoms'> {
  constructor() {
    super('symptoms');
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<SymptomRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: false });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as SymptomRow[];
  }

  async findBySeverity(userId: string, severity: string): Promise<SymptomRow[]> {
    return this.findByUserId(userId, {
      filters: { severity },
      orderBy: { column: 'recorded_at', ascending: false },
    });
  }

  async findByCategory(userId: string, category: string): Promise<SymptomRow[]> {
    return this.findByUserId(userId, {
      filters: { category },
      orderBy: { column: 'recorded_at', ascending: false },
    });
  }

  async findRecent(userId: string, limit = 20): Promise<SymptomRow[]> {
    return this.findByUserId(userId, {
      orderBy: { column: 'recorded_at', ascending: false },
      limit,
    });
  }

  async getTrendData(userId: string, days = 30): Promise<SymptomRow[]> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return this.findByDateRange(userId, startDate, endDate);
  }

  async createSymptom(data: Omit<SymptomInsert, 'user_id'>, userId: string): Promise<SymptomRow | null> {
    return this.create({ ...data, user_id: userId } as SymptomInsert);
  }
}

export const symptomsRepository = new SymptomsRepository();