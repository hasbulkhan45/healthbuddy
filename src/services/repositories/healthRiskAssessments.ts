/**
 * Health Risk Assessments Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type HealthRiskAssessmentRow = Database['public']['Tables']['health_risk_assessments']['Row'];
type HealthRiskAssessmentInsert = Database['public']['Tables']['health_risk_assessments']['Insert'];
type HealthRiskAssessmentUpdate = Database['public']['Tables']['health_risk_assessments']['Update'];

export class HealthRiskAssessmentsRepository extends BaseRepository<'health_risk_assessments'> {
  constructor() {
    super('health_risk_assessments');
  }

  async findLatest(userId: string): Promise<HealthRiskAssessmentRow | null> {
    const results = await this.findByUserId(userId, {
      orderBy: { column: 'assessed_at', ascending: false },
      limit: 1,
    });
    return results[0] ?? null;
  }

  async findByRiskLevel(userId: string, riskLevel: string): Promise<HealthRiskAssessmentRow[]> {
    return this.findByUserId(userId, {
      filters: { risk_level: riskLevel },
      orderBy: { column: 'assessed_at', ascending: false },
    });
  }

  async findByAssessmentType(userId: string, assessmentType: string): Promise<HealthRiskAssessmentRow[]> {
    return this.findByUserId(userId, {
      filters: { assessment_type: assessmentType },
      orderBy: { column: 'assessed_at', ascending: false },
    });
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<HealthRiskAssessmentRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('assessed_at', startDate)
      .lte('assessed_at', endDate)
      .order('assessed_at', { ascending: false });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as HealthRiskAssessmentRow[];
  }

  async createAssessment(data: Omit<HealthRiskAssessmentInsert, 'user_id'>, userId: string): Promise<HealthRiskAssessmentRow | null> {
    return this.create({ ...data, user_id: userId } as HealthRiskAssessmentInsert);
  }

  async getTrendData(userId: string, assessmentType: string, limit = 10): Promise<HealthRiskAssessmentRow[]> {
    return this.findByAssessmentType(userId, assessmentType);
  }
}

export const healthRiskAssessmentsRepository = new HealthRiskAssessmentsRepository();