/**
 * Prescriptions Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type PrescriptionRow = Database['public']['Tables']['prescriptions']['Row'];
type PrescriptionInsert = Database['public']['Tables']['prescriptions']['Insert'];
type PrescriptionUpdate = Database['public']['Tables']['prescriptions']['Update'];

type PrescriptionMedicineRow = Database['public']['Tables']['prescription_medicines']['Row'];
type PrescriptionMedicineInsert = Database['public']['Tables']['prescription_medicines']['Insert'];
type PrescriptionMedicineUpdate = Database['public']['Tables']['prescription_medicines']['Update'];

export class PrescriptionsRepository extends BaseRepository<'prescriptions'> {
  constructor() {
    super('prescriptions');
  }

  async findByVerificationStatus(userId: string, status: string): Promise<PrescriptionRow[]> {
    return this.findByUserId(userId, {
      filters: { verification_status: status },
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findNeedsReview(userId: string): Promise<PrescriptionRow[]> {
    return this.findByVerificationStatus(userId, 'needs_review');
  }

  async findConfirmed(userId: string): Promise<PrescriptionRow[]> {
    return this.findByVerificationStatus(userId, 'user_confirmed');
  }

  async getWithMedicines(prescriptionId: string, userId: string): Promise<{ prescription: PrescriptionRow | null; medicines: PrescriptionMedicineRow[] }> {
    if (this.isDemoMode) return { prescription: null, medicines: [] };
    const supabase = this.getClient();

    const { data: prescription, error: prescError } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', prescriptionId)
      .eq('user_id', userId)
      .single();

    if (prescError || !prescription) return { prescription: null, medicines: [] };

    const { data: medicines, error: medsError } = await supabase
      .from('prescription_medicines')
      .select('*')
      .eq('prescription_id', prescriptionId);

    if (medsError) return { prescription: prescription as PrescriptionRow, medicines: [] };

    return { prescription: prescription as PrescriptionRow, medicines: (medicines ?? []) as PrescriptionMedicineRow[] };
  }

  async verifyPrescription(prescriptionId: string, userId: string, status: 'user_confirmed' | 'needs_review' = 'user_confirmed'): Promise<PrescriptionRow | null> {
    return this.updateByUserId(userId, { id: prescriptionId }, {
      verification_status: status,
      workflow_stage: status === 'user_confirmed' ? 'confirmed' : 'needs_review',
      requires_user_review: status !== 'user_confirmed',
      updated_at: new Date().toISOString(),
    } as PrescriptionUpdate);
  }
}

export class PrescriptionMedicinesRepository extends BaseRepository<'prescription_medicines'> {
  constructor() {
    super('prescription_medicines');
  }

  async findByPrescriptionId(prescriptionId: string): Promise<PrescriptionMedicineRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('prescription_id', prescriptionId);
    if (error || !data) return [];
    return data as PrescriptionMedicineRow[];
  }

  async createMany(medicines: PrescriptionMedicineInsert[]): Promise<PrescriptionMedicineRow[]> {
    return this.createMany(medicines);
  }

  async updateVerificationStatus(id: string, status: PrescriptionMedicineRow['verification_status']): Promise<PrescriptionMedicineRow | null> {
    return this.update(id, { verification_status: status } as PrescriptionMedicineUpdate);
  }
}

export const prescriptionsRepository = new PrescriptionsRepository();
export const prescriptionMedicinesRepository = new PrescriptionMedicinesRepository();