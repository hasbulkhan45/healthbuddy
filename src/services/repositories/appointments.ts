/**
 * Appointments Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentsRepository extends BaseRepository<'appointments'> {
  constructor() {
    super('appointments');
  }

  async findUpcoming(userId: string): Promise<AppointmentRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('appointment_date', now)
      .order('appointment_date', { ascending: true });

    if (error || !data) return [];
    return data as AppointmentRow[];
  }

  async findPast(userId: string): Promise<AppointmentRow[]> {
    if (this.isDemoMode) return [];
    const supabase = this.getClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .lt('appointment_date', now)
      .order('appointment_date', { ascending: false });

    if (error || !data) return [];
    return data as AppointmentRow[];
  }

  async findByStatus(userId: string, status: string): Promise<AppointmentRow[]> {
    return this.findByUserId(userId, {
      filters: { status },
      orderBy: { column: 'appointment_date', ascending: true },
    });
  }

  async findByDateRange(userId: string, startDate: string, endDate: string): Promise<AppointmentRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as AppointmentRow[];
  }

  async findToday(userId: string): Promise<AppointmentRow[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    return this.findByDateRange(userId, startOfDay, endOfDay);
  }

  async updateStatus(appointmentId: string, status: AppointmentRow['status']): Promise<AppointmentRow | null> {
    return this.update(appointmentId, { status } as AppointmentUpdate);
  }
}

export const appointmentsRepository = new AppointmentsRepository();