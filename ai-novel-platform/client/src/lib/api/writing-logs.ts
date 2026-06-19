import { api } from './client';
import type { WritingLog } from '@/types';

export const writingLogsApi = {
  list: (bookId: string, limit = 50, offset = 0) =>
    api.get<WritingLog[]>(`/books/${bookId}/writing-logs?limit=${limit}&offset=${offset}`),
};