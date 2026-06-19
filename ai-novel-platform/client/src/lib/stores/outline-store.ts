import { create } from 'zustand';
import type { OutlineNode } from '@/types';
import { outlinesApi } from '@/lib/api/outlines';

interface OutlineStore {
  outlines: OutlineNode[];
  loading: boolean;
  fetchOutlines: (bookId: string) => Promise<void>;
  createOutline: (bookId: string, data: Parameters<typeof outlinesApi.create>[1]) => Promise<OutlineNode>;
  updateOutline: (outlineId: string, data: Parameters<typeof outlinesApi.update>[1]) => Promise<void>;
  deleteOutline: (outlineId: string) => Promise<void>;
  reorder: (bookId: string, items: { id: string; sort_order: number }[]) => Promise<void>;
}

export const useOutlineStore = create<OutlineStore>((set, get) => ({
  outlines: [],
  loading: false,

  fetchOutlines: async (bookId) => {
    set({ loading: true });
    const outlines = await outlinesApi.list(bookId);
    set({ outlines, loading: false });
  },

  createOutline: async (bookId, data) => {
    const outline = await outlinesApi.create(bookId, data);
    set((s) => ({ outlines: [...s.outlines, outline] }));
    return outline;
  },

  updateOutline: async (outlineId, data) => {
    const outline = await outlinesApi.update(outlineId, data);
    set((s) => ({
      outlines: s.outlines.map((o) => (o.id === outlineId ? outline : o)),
    }));
  },

  deleteOutline: async (outlineId) => {
    await outlinesApi.delete(outlineId);
    set((s) => ({ outlines: s.outlines.filter((o) => o.id !== outlineId) }));
  },

  reorder: async (bookId, items) => {
    await outlinesApi.reorder(bookId, { items });
  },
}));