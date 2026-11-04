/**
 * Repositories Index - Export all repositories
 */

export { BaseRepository, type RepositoryOptions, type QueryOptions, type PaginatedResult } from './base';
export { profilesRepository } from './profiles';
export { healthMetricsRepository } from './healthMetrics';
export { medicalRecordsRepository } from './medicalRecords';
export { prescriptionsRepository, prescriptionMedicinesRepository } from './prescriptions';
export { medicationsRepository } from './medications';
export { symptomsRepository } from './symptoms';
export { appointmentsRepository } from './appointments';
export { followUpTasksRepository } from './followUpTasks';
export { preventiveCareRepository } from './preventiveCare';
export { healthRiskAssessmentsRepository } from './healthRiskAssessments';
export { aiConversationsRepository } from './aiConversations';
export { aiMessagesRepository } from './aiMessages';
export { notificationsRepository } from './notifications';
export { healthInsightsRepository } from './healthInsights';
export { carePlansRepository } from './carePlans';