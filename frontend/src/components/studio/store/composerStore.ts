import { create } from 'zustand';
import type { ComposerPreset, Composition } from '../types';
import * as api from '../services/videoApi';

interface ComposerState {
  presets: ComposerPreset[];
  compositions: Record<string, Composition[]>; // keyed by videoId
  isGenerating: boolean;
  generateError: string | null;
  viewingComposition: Composition | null;

  fetchPresets: () => Promise<void>;
  fetchCompositions: (videoId: string) => Promise<void>;
  generate: (videoId: string, preset: string) => Promise<void>;
  remove: (compositionId: string, videoId: string) => Promise<void>;
  setViewingComposition: (composition: Composition | null) => void;
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  presets: [],
  compositions: {},
  isGenerating: false,
  generateError: null,
  viewingComposition: null,

  fetchPresets: async () => {
    try {
      const presets = await api.fetchPresets();
      set({ presets });
    } catch (err: any) {
      console.error('Failed to fetch presets:', err);
    }
  },

  fetchCompositions: async (videoId: string) => {
    try {
      const list = await api.fetchCompositions(videoId);
      set(s => ({
        compositions: { ...s.compositions, [videoId]: list },
      }));
    } catch (err: any) {
      console.error('Failed to fetch compositions:', err);
    }
  },

  generate: async (videoId: string, preset: string) => {
    set({ isGenerating: true, generateError: null });
    try {
      const composition = await api.generateComposition(videoId, preset);
      set(s => {
        const existing = s.compositions[videoId] ?? [];
        return {
          isGenerating: false,
          compositions: {
            ...s.compositions,
            [videoId]: [composition, ...existing],
          },
        };
      });
    } catch (err: any) {
      set({ isGenerating: false, generateError: err?.response?.data?.error ?? err.message });
    }
  },

  remove: async (compositionId: string, videoId: string) => {
    try {
      await api.deleteComposition(compositionId);
      set(s => ({
        compositions: {
          ...s.compositions,
          [videoId]: (s.compositions[videoId] ?? []).filter(c => c.id !== compositionId),
        },
      }));
    } catch (err: any) {
      console.error('Failed to delete composition:', err);
    }
  },

  setViewingComposition: (composition) => {
    set({ viewingComposition: composition });
  },
}));
