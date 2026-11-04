/**
 * Care Plans Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type CarePlanRow = Database['public']['Tables']['care_plans']['Row'];
type CarePlanInsert = Database['public']['Tables']['care_plans']['Insert'];
type CarePlanUpdate = Database['public']['Tables']['care_plans']['Update'];

export class CarePlansRepository extends BaseRepository<'care_plans'> {
  constructor() {
    super('care_plans');
  }

  async findActive(userId: string): Promise<CarePlanRow[]> {
    return this.findByUserId(userId, {
      filters: { status: 'active' },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findByStatus(userId: string, status: string): Promise<CarePlanRow[]> {
    return this.findByUserId(userId, {
      filters: { status },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findBySource(userId: string, sourceType: string): Promise<CarePlanRow[]> {
    return this.findByUserId(userId, {
      filters: { source_type: sourceType },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<CarePlanRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as CarePlanRow[];
  }

  async findLatest(userId: string): Promise<CarePlanRow | null> {
    const results = await this.findByUserId(userId, {
      orderBy: { column: 'created_at', ascending: false },
      limit: 1,
    });
    return results[0] ?? null;
  }

  async createCarePlan(data: Omit<CarePlanInsert, 'user_id'>, userId: string): Promise<CarePlanRow | null> {
    return this.create({ ...data, user_id: userId } as CarePlanInsert);
  }

  async updateStatus(carePlanId: string, status: CarePlanRow['status']): Promise<CarePlanRow | null> {
    return this.update(carePlanId, { status } as CarePlanUpdate);
  }

  async updateProgress(carePlanId: string, progress: number): Promise<CarePlanRow | null> {
    return this.update(carePlanId, { progress: Math.min(100, Math.max(0, progress)) } as CarePlanUpdate);
  }

  async completePlan(carePlanId: string): Promise<CarePlanRow | null> {
    return this.update(carePlanId, {
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString(),
    } as CarePlanUpdate);
  }
}

export const carePlansRepository = new CarePlansRepository();