/**
 * Reports Service - Medical records management with real database integration
 */

import { medicalRecordsRepository, extractedLabResultsRepository } from '@/services/repositories';
import { documentStorageService } from '@/services/storage';
import { ocrService } from '@/services/ocr';
import type { MedicalRecord, DocumentCategory, ExtractedLabResult, ExtractionStatus } from '@/types/report';
import type { Database } from '@/types/database';

type DBMedicalRecord = Database['public']['Tables']['medical_records']['Row'];
type DBExtractedLabResult = Database['public']['Tables']['extracted_lab_results']['Row'];

const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(cb => cb());
}

function mapDBRecordToMedicalRecord(dbRecord: DBMedicalRecord, labResults: DBExtractedLabResult[] = []): MedicalRecord {
  return {
    id: dbRecord.id,
    userId: dbRecord.user_id,
    title: dbRecord.title,
    category: dbRecord.category as DocumentCategory,
    categoryLabel: dbRecord.category_label ?? dbRecord.category.replace(/_/g, ' ').toUpperCase(),
    institutionName: dbRecord.institution_name ?? 'Unknown Institution',
    physicianName: undefined, // Not in DB schema
    documentDate: dbRecord.document_date ?? new Date().toISOString().split('T')[0],
    uploadedAt: dbRecord.uploaded_at ?? dbRecord.created_at,
    fileSize: dbRecord.file_size ?? '0 MB',
    fileType: dbRecord.file_type as 'pdf' | 'jpg' | 'png' | undefined ?? 'pdf',
    verificationStatus: mapVerificationStatus(dbRecord.verification_status),
    summary: dbRecord.summary ?? 'No summary available',
    extractedResults: labResults.map(mapDBLabResult),
    previewUrl: dbRecord.file_path ?? undefined,
    aiExplanation: undefined,
  };
}

function mapDBLabResult(dbResult: DBExtractedLabResult): ExtractedLabResult {
  return {
    id: dbResult.id,
    testName: dbResult.testName,
    resultValue: dbResult.resultValue,
    unit: dbResult.unit,
    referenceRange: dbResult.referenceRange,
    status: dbResult.status as 'normal' | 'borderline' | 'abnormal',
    statusLabel: dbResult.statusLabel ?? dbResult.status,
    extractionStatus: mapExtractionStatus(dbResult.extractionStatus),
    userNotes: dbResult.notes ?? undefined,
  };
}

function mapVerificationStatus(status: DBMedicalRecord['verification_status']): MedicalRecord['verificationStatus'] {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'user_confirmed':
      return 'Verified';
    case 'extracted':
      return 'Extracted - Review Required';
    case 'needs_review':
      return 'Pending Review';
    default:
      return 'Pending Review';
  }
}

function mapExtractionStatus(status: DBExtractedLabResult['extractionStatus']): ExtractionStatus {
  switch (status) {
    case 'user_confirmed':
      return 'user_confirmed';
    case 'rejected':
      return 'unable_to_extract';
    case 'flagged':
      return 'unverified';
    default:
      return 'extracted';
  }
}

function mapCategoryToDB(category: DocumentCategory): DBMedicalRecord['category'] {
  if (category === 'all') return 'lab_report';
  return category as DBMedicalRecord['category'];
}

export const reportsService = {
  async getReports(category?: DocumentCategory, userId?: string): Promise<MedicalRecord[]> {
    // If no userId provided, return empty array (will be loaded client-side with auth)
    if (!userId) return [];

    const dbCategory = category && category !== 'all' ? mapCategoryToDB(category) : undefined;
    const dbRecords = await medicalRecordsRepository.findByUserId(userId, {
      filters: dbCategory ? { category: dbCategory } : undefined,
      orderBy: { column: 'uploaded_at', ascending: false },
    });

    // Fetch extracted lab results for each record
    const results: MedicalRecord[] = [];
    for (const record of dbRecords) {
      const labResults = await extractedLabResultsRepository.findByRecordId(record.id);
      results.push(mapDBRecordToMedicalRecord(record, labResults));
    }

    return results;
  },

  async getReportById(id: string, userId?: string): Promise<MedicalRecord | undefined> {
    if (!userId) return undefined;

    const dbRecord = await medicalRecordsRepository.findById(id);
    if (!dbRecord || dbRecord.user_id !== userId) return undefined;

    const labResults = await extractedLabResultsRepository.findByRecordId(id);
    return mapDBRecordToMedicalRecord(dbRecord, labResults);
  },

  async uploadReport(
    file: { name: string; size: number; type: string },
    metadata: { title: string; category: DocumentCategory; institutionName: string; documentDate: string },
    userId: string
  ): Promise<MedicalRecord> {
    // Upload file to storage
    const fileBuffer = new ArrayBuffer(file.size); // Placeholder - in real app, get from file input
    const uploadResult = await documentStorageService.uploadFile(
      new File([fileBuffer], file.name, { type: file.type }),
      userId
    );

    // Extract text using OCR
    const ocrResult = await ocrService.extractMedicalDocument(
      Buffer.from(fileBuffer).toString('base64'),
      file.type,
      metadata.category === 'prescription' ? 'prescription' : 'lab_report'
    );

    // Create medical record in database
    const dbRecord = await medicalRecordsRepository.create({
      user_id: userId,
      title: metadata.title,
      category: mapCategoryToDB(metadata.category),
      category_label: metadata.category.replace(/_/g, ' ').toUpperCase(),
      institution_name: metadata.institutionName,
      document_date: metadata.documentDate,
      file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      file_type: file.type.includes('pdf') ? 'pdf' : 'png',
      file_path: uploadResult.path,
      verification_status: 'extracted',
      summary: ocrResult.rawText.slice(0, 500) ?? 'Document uploaded and processed',
      extracted_results: ocrResult.structuredData as any,
      raw_text: ocrResult.rawText,
      uploaded_at: new Date().toISOString(),
    });

    if (!dbRecord) {
      throw new Error('Failed to create medical record');
    }

    // Save extracted lab results
    if (ocrResult.structuredData.labValues && ocrResult.structuredData.labValues.length > 0) {
      for (const labValue of ocrResult.structuredData.labValues) {
        const status = mapHealthMetricStatus(labValue.value, labValue.referenceRange);
        await extractedLabResultsRepository.create({
          recordId: dbRecord.id,
          testName: labValue.test,
          resultValue: String(labValue.value),
          unit: labValue.unit,
          referenceRange: labValue.referenceRange,
          status: status,
          statusLabel: status,
          extractionStatus: 'extracted',
          confidence: ocrResult.confidence,
          notes: null,
        });
      }
    }

    notifySubscribers();

    // Fetch and return the complete record
    const labResults = await extractedLabResultsRepository.findByRecordId(dbRecord.id);
    return mapDBRecordToMedicalRecord(dbRecord, labResults);
  },

  async confirmResult(recordId: string, resultId: string, userId: string): Promise<boolean> {
    const dbRecord = await medicalRecordsRepository.findById(recordId);
    if (!dbRecord || dbRecord.user_id !== userId) return false;

    const updated = await extractedLabResultsRepository.update(resultId, {
      extractionStatus: 'user_confirmed',
    });

    if (updated) {
      // Check if all results are confirmed, then update record status
      const allResults = await extractedLabResultsRepository.findByRecordId(recordId);
      const allConfirmed = allResults.every(r => r.extractionStatus === 'user_confirmed');

      if (allConfirmed) {
        await medicalRecordsRepository.update(recordId, {
          verification_status: 'user_confirmed',
        });
      }

      notifySubscribers();
      return true;
    }

    return false;
  },

  subscribe(callback: () => void) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },
};

function mapHealthMetricStatus(value: number, referenceRange: string): 'normal' | 'borderline' | 'high' | 'low' | 'critical' {
  // Simple parsing of reference range like "70 – 100" or "70-100"
  const match = referenceRange.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/);
  if (!match) return 'normal';

  const min = parseFloat(match[1]);
  const max = parseFloat(match[2]);

  if (value < min * 0.5 || value > max * 2) return 'critical';
  if (value < min * 0.8 || value > max * 1.2) return value < min ? 'low' : 'high';
  if (value < min || value > max) return 'borderline';
  return 'normal';
}