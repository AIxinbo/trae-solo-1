import { api } from './client';
import type { OutlineNode } from '@/types';

export const outlinesApi = {
  list: (bookId: string) => api.get<OutlineNode[]>(`/books/${bookId}/outlines`),
  create: (bookId: string, data: { parent_id?: string; level: string; title: string; content?: string; word_count_target?: number; sort_order?: number }) =>
    api.post<OutlineNode>(`/books/${bookId}/outlines`, data),
  get: (outlineId: string) => api.get<OutlineNode>(`/books/outlines/${outlineId}`),
  update: (outlineId: string, data: Partial<OutlineNode>) => api.put<OutlineNode>(`/books/outlines/${outlineId}`, data),
  delete: (outlineId: string) => api.delete<void>(`/books/outlines/${outlineId}`),
  reorder: (bookId: string, data: { items: { id: string; sort_order: number }[] }) =>
    api.post<void>(`/books/${bookId}/outlines/reorder`, data),
};