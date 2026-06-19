import { api } from './client';
import type { DetailedOutline } from '@/types';

export interface DetailedOutlineCreate {
  chapter_id: string;
  scene_index: number;
  title: string;
  function?: string;
  emotion?: string;
  word_count_target?: number;
  characters?: string[];
  location?: string;
  day_number?: number;
  description?: string;
  key_dialogues?: string;
  pleasure_types?: string[];
}

export const detailedOutlinesApi = {
  list: (bookId: string) => api.get<DetailedOutline[]>(`/books/${bookId}/detailed-outlines`),
  create: (bookId: string, data: DetailedOutlineCreate) => api.post<DetailedOutline>(`/books/${bookId}/detailed-outlines`, data),
  get: (id: string) => api.get<DetailedOutline>(`/detailed-outlines/${id}`),
  update: (id: string, data: Partial<DetailedOutline>) => api.put<DetailedOutline>(`/detailed-outlines/${id}`, data),
  delete: (id: string) => api.delete<void>(`/detailed-outlines/${id}`),
  reorder: (bookId: string, data: { items: { id: string; sort_order: number }[] }) =>
    api.post<void>(`/books/${bookId}/detailed-outlines/reorder`, data),
};