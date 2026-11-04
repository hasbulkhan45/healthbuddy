/**
 * Medications Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type MedicationRow = Database['public']['Tables']['medications']['Row'];
type MedicationInsert = Database['public']['Tables']['medications']['Insert'];
type MedicationUpdate = Database['public']['Tables']['medications']['Update'];

export class MedicationsRepository extends BaseRepository<'medications'> {
  constructor() {
    super('medications');
  }

  async findActive(userId: string): Promise<MedicationRow[]> {
    return this.findByUserId(userId, {
      filters: { is_active: true },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findByFrequency(userId: string, frequency: string): Promise<MedicationRow[]> {
    return this.findByUserId(userId, {
      filters: { frequency },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findDueToday(userId: string): Promise<MedicationRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as MedicationRow[];
  }

  async updateAdherence(medicationId: string, adherence: MedicationRow['adherence_rate']): Promise<MedicationRow | null> {
    return this.update(medicationId, { adherence_rate: adherence } as MedicationUpdate);
  }

  async toggleActive(medicationId: string, isActive: boolean): Promise<MedicationRow | null> {
    return this.update(medicationId, { is_active: isActive } as MedicationUpdate);
  }
}

export const medicationsRepository = new MedicationsRepository();