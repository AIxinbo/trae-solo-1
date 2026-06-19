import { api } from './client';
import type { Chapter } from '@/types';

export interface ChapterCreate {
  title: string;
  outline_id?: string;
  word_count_target?: number;
  sort_order?: number;
}

export interface ChapterUpdate {
  title?: string;
  content?: string;
  word_count?: number;
  word_count_target?: number;
  characters?: string[];
  status?: string;
  ai_summary?: string;
}

export const chaptersApi = {
  list: (bookId: string) => api.get<Chapter[]>(`/books/${bookId}/chapters`),
  create: (bookId: string, data: ChapterCreate) => api.post<Chapter>(`/books/${bookId}/chapters`, data),
  get: (chapterId: string) => api.get<Chapter>(`/chapters/${chapterId}`),
  update: (chapterId: string, data: ChapterUpdate) => api.put<Chapter>(`/chapters/${chapterId}`, data),
  delete: (chapterId: string) => api.delete<void>(`/chapters/${chapterId}`),
};