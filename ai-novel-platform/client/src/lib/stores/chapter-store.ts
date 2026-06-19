import { create } from 'zustand';
import type { Chapter } from '@/types';
import { chaptersApi } from '@/lib/api/chapters';

interface ChapterStore {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  loading: boolean;
  fetchChapters: (bookId: string) => Promise<void>;
  fetchChapter: (chapterId: string) => Promise<void>;
  createChapter: (bookId: string, data: Parameters<typeof chaptersApi.create>[1]) => Promise<Chapter>;
  updateChapter: (chapterId: string, data: Parameters<typeof chaptersApi.update>[1]) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
}

export const useChapterStore = create<ChapterStore>((set, get) => ({
  chapters: [],
  currentChapter: null,
  loading: false,

  fetchChapters: async (bookId) => {
    set({ loading: true });
    const chapters = await chaptersApi.list(bookId);
    set({ chapters, loading: false });
  },

  fetchChapter: async (chapterId) => {
    set({ loading: true });
    const chapter = await chaptersApi.get(chapterId);
    set({ currentChapter: chapter, loading: false });
  },

  createChapter: async (bookId, data) => {
    const chapter = await chaptersApi.create(bookId, data);
    set((s) => ({ chapters: [...s.chapters, chapter] }));
    return chapter;
  },

  updateChapter: async (chapterId, data) => {
    const chapter = await chaptersApi.update(chapterId, data);
    set((s) => ({
      chapters: s.chapters.map((c) => (c.id === chapterId ? chapter : c)),
      currentChapter: s.currentChapter?.id === chapterId ? chapter : s.currentChapter,
    }));
  },

  deleteChapter: async (chapterId) => {
    await chaptersApi.delete(chapterId);
    set((s) => ({
      chapters: s.chapters.filter((c) => c.id !== chapterId),
      currentChapter: s.currentChapter?.id === chapterId ? null : s.currentChapter,
    }));
  },
}));