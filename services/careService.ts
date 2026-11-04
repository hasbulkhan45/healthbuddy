import { mockStore } from "./mockStore";
import { Appointment, PreventiveCareItem, FollowUpTask } from "@/types/care";

export const careService = {
  async getAppointments(): Promise<Appointment[]> {
    return mockStore.getAppointments();
  },

  async addAppointment(data: Omit<Appointment, "id" | "userId">): Promise<Appointment> {
    return mockStore.addAppointment(data);
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    return mockStore.updateAppointment(id, updates);
  },

  async deleteAppointment(id: string): Promise<boolean> {
    return mockStore.deleteAppointment(id);
  },

  async getPreventiveCare(): Promise<PreventiveCareItem[]> {
    return mockStore.getPreventiveCare();
  },

  async getFollowUpTasks(): Promise<FollowUpTask[]> {
    return mockStore.getFollowUpTasks();
  },

  async toggleFollowUpTask(id: string): Promise<FollowUpTask | undefined> {
    return mockStore.toggleFollowUpTask(id);
  },

  async addFollowUpTask(data: Omit<FollowUpTask, "id" | "userId">): Promise<FollowUpTask> {
    return mockStore.addFollowUpTask(data);
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

