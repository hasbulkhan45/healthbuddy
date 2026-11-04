/**
 * Medical Records Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type MedicalRecordRow = Database['public']['Tables']['medical_records']['Row'];
type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert'];
type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update'];

export class MedicalRecordsRepository extends BaseRepository<'medical_records'> {
  constructor() {
    super('medical_records');
  }

  async findByCategory(userId: string, category: string): Promise<MedicalRecordRow[]> {
    return this.findByUserId(userId, {
      filters: { category },
      orderBy: { column: 'uploaded_at', ascending: false },
    });
  }

  async findByVerificationStatus(userId: string, status: string): Promise<MedicalRecordRow[]> {
    return this.findByUserId(userId, {
      filters: { verification_status: status },
      orderBy: { column: 'uploaded_at', ascending: false },
    });
  }

  async search(userId: string, query: string): Promise<MedicalRecordRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,institution_name.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('uploaded_at', { ascending: false });
    if (error || !data) return [];
    return data as MedicalRecordRow[];
  }
}

export const medicalRecordsRepository = new MedicalRecordsRepository();