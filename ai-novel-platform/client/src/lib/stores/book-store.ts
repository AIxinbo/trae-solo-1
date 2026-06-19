import { create } from 'zustand';
import type { BookResponse } from '@/types';
import { booksApi } from '@/lib/api/books';

interface BookStore {
  books: BookResponse[];
  currentBook: BookResponse | null;
  loading: boolean;
  fetchBooks: () => Promise<void>;
  fetchBook: (id: string) => Promise<void>;
  createBook: (data: Parameters<typeof booksApi.create>[0]) => Promise<BookResponse>;
  updateBook: (id: string, data: Parameters<typeof booksApi.update>[1]) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  setCurrentBook: (book: BookResponse | null) => void;
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  currentBook: null,
  loading: false,

  fetchBooks: async () => {
    set({ loading: true });
    const books = await booksApi.list();
    set({ books, loading: false });
  },

  fetchBook: async (id: string) => {
    set({ loading: true });
    const book = await booksApi.get(id);
    set({ currentBook: book, loading: false });
  },

  createBook: async (data) => {
    const book = await booksApi.create(data);
    set((s) => ({ books: [book, ...s.books] }));
    return book;
  },

  updateBook: async (id, data) => {
    const book = await booksApi.update(id, data);
    set((s) => ({
      books: s.books.map((b) => (b.id === id ? book : b)),
      currentBook: s.currentBook?.id === id ? book : s.currentBook,
    }));
  },

  deleteBook: async (id) => {
    await booksApi.delete(id);
    set((s) => ({
      books: s.books.filter((b) => b.id !== id),
      currentBook: s.currentBook?.id === id ? null : s.currentBook,
    }));
  },

  setCurrentBook: (book) => set({ currentBook: book }),
}));