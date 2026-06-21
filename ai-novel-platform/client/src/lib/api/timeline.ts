import { api } from './client';

export interface TimelineEvent {
  id: string;
  book_id: string;
  chapter_id: string | null;
  day_number: number;
  event_desc: string;
  involved_chars: string[];
  location: string;
  season: string;
  importance: number;
  created_at: string;
}

export interface TimelineEventCreate {
  chapter_id?: string;
  day_number: number;
  event_desc: string;
  involved_chars?: string[];
  location?: string;
  season?: string;
  importance?: number;
}

export const timelineApi = {
  list: (bookId: string) => api.get<TimelineEvent[]>(`/books/${bookId}/timeline`),
  create: (bookId: string, data: TimelineEventCreate) => api.post<TimelineEvent>(`/books/${bookId}/timeline`, data),
  update: (eventId: string, data: Partial<TimelineEvent>) => api.put<TimelineEvent>(`/books/timeline/${eventId}`, data),
  delete: (eventId: string) => api.delete<void>(`/books/timeline/${eventId}`),
};