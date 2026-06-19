import { api } from './client';

export interface AnalysisRequest {
  content: string;
  source_title?: string;
  source_author?: string;
  source_type?: string;
}

export interface AnalysisResult {
  success: boolean;
  message: string;
  record_id: string;
  data?: {
    source_title: string;
    source_author: string;
    structure_analysis: Record<string, unknown>;
    character_analysis: Record<string, unknown>;
    rhythm_analysis: Record<string, unknown>;
    techniques: Record<string, unknown>;
  };
}

export interface AnalysisRecord {
  id: string;
  source_title: string;
  source_author: string;
  source_type: string;
  structure_analysis: Record<string, unknown>;
  character_analysis: Record<string, unknown>;
  rhythm_analysis: Record<string, unknown>;
  techniques: Record<string, unknown>;
  created_at: string;
}

export const analysisApi = {
  analyze: (bookId: string, data: AnalysisRequest) =>
    api.post<AnalysisResult>(`/books/${bookId}/analyze`, data),
  listRecords: (bookId: string) =>
    api.get<AnalysisRecord[]>(`/books/${bookId}/analysis-records`),
  getRecord: (recordId: string) =>
    api.get<AnalysisRecord>(`/analysis-records/${recordId}`),
};