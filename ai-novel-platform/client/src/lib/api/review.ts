import { api } from './client';
import type { ReviewResult } from '@/types';

export const reviewApi = {
  reviewChapter: (bookId: string, chapterId: string) =>
    api.post<ReviewResult>(`/books/${bookId}/chapters/${chapterId}/review`),
  getResult: (reviewId: string) => api.get<ReviewResult>(`/reviews/${reviewId}`),
};