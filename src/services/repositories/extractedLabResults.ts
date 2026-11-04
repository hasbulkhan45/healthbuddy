/**
 * Extracted Lab Results Repository
 */

import { BaseRepository } from './base';
import type { Database } from '@/types/database';

type ExtractedLabResultRow = Database['public']['Tables']['extracted_lab_results']['Row'];
type ExtractedLabResultInsert = Database['public']['Tables']['extracted_lab_results']['Insert'];
type ExtractedLabResultUpdate = Database['public']['Tables']['extracted_lab_results']['Update'];

export class ExtractedLabResultsRepository extends BaseRepository<'extracted_lab_results'> {
  constructor() {
    super('extracted_lab_results');
  }

  async findByRecordId(recordId: string): Promise<ExtractedLabResultRow[]> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: true });

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return [];
    return data as ExtractedLabResultRow[];
  }

  async findByTestName(recordId: string, testName: string): Promise<ExtractedLabResultRow | null> {
    let query = this.getClient()
      .from(this.tableName)
      .select('*')
      .eq('record_id', recordId)
      .eq('test_name', testName)
      .single();

    const { data, error } = await this.executeQuery(query);
    if (error || !data) return null;
    return data as ExtractedLabResultRow;
  }

  async updateExtractionStatus(
    resultId: string,
    status: ExtractedLabResultRow['extractionStatus'],
    userNotes?: string
  ): Promise<ExtractedLabResultRow | null> {
    const updates: ExtractedLabResultUpdate = { extractionStatus: status };
    if (userNotes) updates.notes = userNotes;
    return this.update(resultId, updates);
  }

  async confirmResult(resultId: string): Promise<ExtractedLabResultRow | null> {
    return this.updateExtractionStatus(resultId, 'user_confirmed');
  }

  async rejectResult(resultId: string): Promise<ExtractedLabResultRow | null> {
    return this.updateExtractionStatus(resultId, 'rejected');
  }

  async flagResult(resultId: string, notes?: string): Promise<ExtractedLabResultRow | null> {
    return this.updateExtractionStatus(resultId, 'flagged', notes);
  }
}

export const extractedLabResultsRepository = new ExtractedLabResultsRepository();