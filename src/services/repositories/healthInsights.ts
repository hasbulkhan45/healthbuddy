/**
 * Health Insights Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type HealthInsightRow = Database['public']['Tables']['health_insights']['Row'];
type HealthInsightInsert = Database['public']['Tables']['health_insights']['Insert'];
type HealthInsightUpdate = Database['public']['Tables']['health_insights']['Update'];

export class HealthInsightsRepository extends BaseRepository<'health_insights'> {
  constructor() {
    super('health_insights');
  }

  async findUnread(userId: string): Promise<HealthInsightRow[]> {
    return this.findByUserId(userId, {
      filters: { is_read: false },
      orderBy: { column: 'generated_at', ascending: false },
    });
  }

  async findByType(userId: string, type: string): Promise<HealthInsightRow[]> {
    return this.findByUserId(userId, {
      filters: { insight_type: type },
      orderBy: { column: 'generated_at', ascending: false },
    });
  }

  async findBySeverity(userId: string, severity: string): Promise<HealthInsightRow[]> {
    return this.findByUserId(userId, {
      filters: { severity },
      orderBy: { column: 'generated_at', ascending: false },
    });
  }

  async findRecent(userId: string, limit = 20): Promise<HealthInsightRow[]> {
    return this.findByUserId(userId, {
      orderBy: { column: 'generated_at', ascending: false },
      limit,
    });
  }

  async findActionable(userId: string): Promise<HealthInsightRow[]> {
    return this.findByUserId(userId, {
      filters: { is_actionable: true, is_dismissed: false },
      orderBy: { column: 'generated_at', ascending: false },
    });
  }

  async markAsRead(insightId: string): Promise<HealthInsightRow | null> {
    return this.update(insightId, { is_read: true } as HealthInsightUpdate);
  }

  async dismiss(insightId: string): Promise<HealthInsightRow | null> {
    return this.update(insightId, { is_dismissed: true } as HealthInsightUpdate);
  }

  async createInsight(data: Omit<HealthInsightInsert, 'user_id'>, userId: string): Promise<HealthInsightRow | null> {
    return this.create({ ...data, user_id: userId } as HealthInsightInsert);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.count(userId, { is_read: false });
  }

  async getActionableCount(userId: string): Promise<number> {
    return this.count(userId, { is_actionable: true, is_dismissed: false });
  }
}

export const healthInsightsRepository = new HealthInsightsRepository();