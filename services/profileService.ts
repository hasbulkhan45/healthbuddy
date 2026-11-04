import { mockStore } from "./mockStore";
import { UserProfile, AllergyItem } from "@/types/user";

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    return mockStore.getUser();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return mockStore.updateUser(updates);
  },

  async getAllergies(): Promise<AllergyItem[]> {
    return mockStore.getAllergies();
  },

  async addAllergy(data: Omit<AllergyItem, "id">): Promise<AllergyItem> {
    return mockStore.addAllergy(data);
  },

  async deleteAllergy(id: string): Promise<boolean> {
    return mockStore.deleteAllergy(id);
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

