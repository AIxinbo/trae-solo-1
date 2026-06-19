import { api } from './client';

export interface GenerateResponse {
  success: boolean;
  message: string;
  data?: {
    content?: string;
    plan?: Record<string, unknown>;
    word_count?: number;
    volumes?: Array<{
      title: string;
      summary: string;
      chapters: Array<{ title: string; summary: string; word_count_target: number; emotion_curve: string; key_events: string[] }>;
    }>;
    characters?: Array<Record<string, unknown>>;
  };
}

export const generateApi = {
  chapter: (bookId: string, chapterId: string, targetWords: number = 2000) =>
    api.post<GenerateResponse>(`/books/${bookId}/generate-chapter`, {
      chapter_id: chapterId,
      target_words: targetWords,
    }),
  outline: (bookId: string) =>
    api.post<GenerateResponse>(`/books/${bookId}/generate-outline`, {}),
  characters: (bookId: string) =>
    api.post<GenerateResponse>(`/books/${bookId}/generate-characters`, {}),
};