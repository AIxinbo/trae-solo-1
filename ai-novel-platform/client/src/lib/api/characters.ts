import { api } from './client';
import type { Character } from '@/types';

export interface CharacterCreate {
  name: string;
  age?: string;
  gender?: string;
  role_type?: string;
  appearance?: string;
  personality?: string;
  background?: string;
  motivation?: string;
  speech_style?: string;
  formality_level?: number;
  avg_sentence_len?: number;
  favorite_words?: string[];
  forbidden_words?: string[];
  tone_words?: string[];
}

export const charactersApi = {
  list: (bookId: string) => api.get<Character[]>(`/books/${bookId}/characters`),
  create: (bookId: string, data: CharacterCreate) => api.post<Character>(`/books/${bookId}/characters`, data),
  get: (characterId: string) => api.get<Character>(`/characters/${characterId}`),
  update: (characterId: string, data: Partial<Character>) => api.put<Character>(`/characters/${characterId}`, data),
  delete: (characterId: string) => api.delete<void>(`/characters/${characterId}`),
};