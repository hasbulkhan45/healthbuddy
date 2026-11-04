/**
 * Profiles Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class ProfilesRepository extends BaseRepository<'profiles'> {
  constructor() {
    super('profiles');
  }

  async getCurrentUserProfile(): Promise<ProfileRow | null> {
    if (this.isDemoMode) return null;
    const supabase = this.getClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return this.findById(user.id);
  }

  async upsertProfile(userId: string, data: Partial<ProfileInsert>): Promise<ProfileRow | null> {
    const existing = await this.findById(userId);
    if (existing) {
      return this.update(userId, data as ProfileUpdate);
    }
    return this.create({ ...data, id: userId } as ProfileInsert);
  }

  async updateAiPermissions(userId: string, permissions: Partial<ProfileRow['ai_permissions']>): Promise<ProfileRow | null> {
    const profile = await this.findById(userId);
    if (!profile) return null;
    return this.update(userId, {
      ai_permissions: { ...profile.ai_permissions, ...permissions }
    } as ProfileUpdate);
  }

  async updateHealthProfile(userId: string, healthProfile: Partial<ProfileRow['health_profile']>): Promise<ProfileRow | null> {
    const profile = await this.findById(userId);
    if (!profile) return null;
    return this.update(userId, {
      health_profile: { ...profile.health_profile, ...healthProfile }
    } as ProfileUpdate);
  }

  async updateLifestyle(userId: string, lifestyle: Partial<ProfileRow['lifestyle']>): Promise<ProfileRow | null> {
    const profile = await this.findById(userId);
    if (!profile) return null;
    return this.update(userId, {
      lifestyle: { ...profile.lifestyle, ...lifestyle }
    } as ProfileUpdate);
  }
}

export const profilesRepository = new ProfilesRepository();