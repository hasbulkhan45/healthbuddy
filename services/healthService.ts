import { mockStore } from "./mockStore";
import { HealthMeasurement, WellnessScore, HealthRiskCategory, MetricTrendPoint } from "@/types/health";
import { mockHistoricalTrends } from "@/data/mock/health-metrics";

export const healthService = {
  async getOverview(): Promise<{
    wellnessScore: WellnessScore;
    measurements: HealthMeasurement[];
  }> {
    return {
      wellnessScore: mockStore.getWellnessScore(),
      measurements: mockStore.getMeasurements(),
    };
  },

  async getMeasurements(): Promise<HealthMeasurement[]> {
    return mockStore.getMeasurements();
  },

  async getHistoricalTrends(metric: string): Promise<MetricTrendPoint[]> {
    return mockHistoricalTrends[metric] || mockHistoricalTrends.blood_pressure;
  },

  async getHealthRisks(): Promise<HealthRiskCategory[]> {
    return mockStore.getHealthRisks();
  },

  async addMeasurement(
    data: Omit<HealthMeasurement, "id" | "userId" | "recordedAt">
  ): Promise<HealthMeasurement> {
    return mockStore.addMeasurement(data);
  },

  async deleteMeasurement(id: string): Promise<boolean> {
    return mockStore.deleteMeasurement(id);
  },

  subscribe(callback: () => void) {
    return mockStore.subscribe(callback);
  },
};

