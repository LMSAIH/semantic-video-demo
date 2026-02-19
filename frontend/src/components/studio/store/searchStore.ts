import { create } from 'zustand';
import * as videoApi from '../services/videoApi';
import type { SearchResultItem } from '../services/videoApi';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface SearchState {
  query: string;
  results: SearchResultItem[];
  isSearching: boolean;
  isGenerating: boolean;
  /** Similarity threshold: 0–1. Higher = stricter matching */
  threshold: number;
  /** Whether the search panel is expanded */
  isSearchOpen: boolean;
  searchError: string | null;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setThreshold: (threshold: number) => void;
  setIsSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  search: () => Promise<void>;
  clearSearch: () => void;
  generateEmbeddings: (
    videoId: string,
    frames: Array<{ frameNumber: number; timestamp: number; description: string }>,
  ) => Promise<void>;
}

export type SearchStore = SearchState & SearchActions;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useSearchStore = create<SearchStore>()((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  isGenerating: false,
  threshold: 0.3,
  isSearchOpen: false,
  searchError: null,

  setQuery: (query) => set({ query }),
  setThreshold: (threshold) => set({ threshold }),
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  toggleSearch: () => set(s => ({ isSearchOpen: !s.isSearchOpen })),

  search: async () => {
    const { query, threshold } = get();
    if (!query.trim()) {
      set({ results: [], searchError: null });
      return;
    }

    set({ isSearching: true, searchError: null });
    try {
      const results = await videoApi.semanticSearch(query.trim(), threshold, 30);
      set({ results });
    } catch (err: any) {
      console.error('Search failed:', err);
      set({ searchError: err?.response?.data?.details || 'Search failed' });
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ query: '', results: [], searchError: null }),

  generateEmbeddings: async (videoId, frames) => {
    set({ isGenerating: true });
    try {
      await videoApi.generateEmbeddings(videoId, frames);
    } catch (err) {
      console.error('Embedding generation failed:', err);
    } finally {
      set({ isGenerating: false });
    }
  },
}));
