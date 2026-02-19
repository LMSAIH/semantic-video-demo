import { create } from 'zustand';
import type { Model } from '../types';
import * as videoApi from '../services/videoApi';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface ModelState {
  models: Model[];
  isLoading: boolean;
}

interface ModelActions {
  fetchModels: () => Promise<void>;
}

export type ModelStore = ModelState & ModelActions;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useModelStore = create<ModelStore>()((set) => ({
  models: [],
  isLoading: false,

  fetchModels: async () => {
    set({ isLoading: true });
    try {
      const models = await videoApi.fetchModels();
      set({ models });
    } catch (err) {
      console.error('Failed to fetch models:', err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
