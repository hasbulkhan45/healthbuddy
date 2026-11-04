/**
 * Health Metrics Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type HealthMetricRow = Database['public']['Tables']['health_metrics']['Row'];
type HealthMetricInsert = Database['public']['Tables']['health_metrics']['Insert'];
type HealthMetricUpdate = Database['public']['Tables']['health_metrics']['Update'];

export class HealthMetricsRepository extends BaseRepository<'health_metrics'> {
  constructor() {
    super('health_metrics');
  }

  async findByType(userId: string, metricType: string, limit = 50): Promise<HealthMetricRow[]> {
    return this.findByUserId(userId, {
      filters: { metric_type: metricType },
      orderBy: { column: 'recorded_at', ascending: false },
      limit,
    });
  }

  async findLatestByType(userId: string, metricType: string): Promise<HealthMetricRow | null> {
    const results = await this.findByType(userId, metricType, 1);
    return results[0] ?? null;
  }

  async findByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    metricType?: string
  ): Promise<HealthMetricRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: true });

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as HealthMetricRow[];
  }

  async getTrendData(userId: string, metricType: string, days = 30): Promise<HealthMetricRow[]> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return this.findByDateRange(userId, startDate, endDate, metricType);
  }

  async createMetric(data: Omit<HealthMetricInsert, 'user_id'>, userId: string): Promise<HealthMetricRow | null> {
    return this.create({ ...data, user_id: userId } as HealthMetricInsert);
  }
}

export const healthMetricsRepository = new HealthMetricsRepository();