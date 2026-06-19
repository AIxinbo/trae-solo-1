import { api } from './client';
import type { BookResponse, BookCreate, BookUpdate } from '@/types';

export const booksApi = {
  list: () => api.get<BookResponse[]>('/books'),
  create: (data: BookCreate) => api.post<BookResponse>('/books', data),
  get: (id: string) => api.get<BookResponse>(`/books/${id}`),
  update: (id: string, data: BookUpdate) => api.put<BookResponse>(`/books/${id}`, data),
  delete: (id: string) => api.delete<void>(`/books/${id}`),
};