import { create } from 'zustand';
import type { AnalysisResult } from '../types';
import type { EstimateResponse } from '../services/videoApi';
import * as videoApi from '../services/videoApi';
import { buildAnalysisConfig } from '../utils/videoHelpers';
import { useVideoLibraryStore } from './videoLibraryStore';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface AnalysisState {
  isAnalyzing: boolean;
  analysisProgress: number;
  estimateData: EstimateResponse | null;
  isEstimateModalOpen: boolean;
  isEstimating: boolean;
  isVideoSelectionModalOpen: boolean;
  isEstimateSelectionModalOpen: boolean;
}

interface AnalysisActions {
  setIsEstimateModalOpen: (v: boolean) => void;
  setIsVideoSelectionModalOpen: (v: boolean) => void;
  setIsEstimateSelectionModalOpen: (v: boolean) => void;
  showVideoSelectionModal: () => void;
  showEstimateSelectionModal: () => void;
  estimateTokens: (videoIds?: string[]) => Promise<void>;
  runAnalysis: (videoIds?: string[]) => Promise<void>;
}

export type AnalysisStore = AnalysisState & AnalysisActions;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useAnalysisStore = create<AnalysisStore>()((set) => ({
  isAnalyzing: false,
  analysisProgress: 0,
  estimateData: null,
  isEstimateModalOpen: false,
  isEstimating: false,
  isVideoSelectionModalOpen: false,
  isEstimateSelectionModalOpen: false,

  setIsEstimateModalOpen: (v) => set({ isEstimateModalOpen: v }),
  setIsVideoSelectionModalOpen: (v) => set({ isVideoSelectionModalOpen: v }),
  setIsEstimateSelectionModalOpen: (v) => set({ isEstimateSelectionModalOpen: v }),
  showVideoSelectionModal: () => set({ isVideoSelectionModalOpen: true }),
  showEstimateSelectionModal: () => set({ isEstimateSelectionModalOpen: true }),

  estimateTokens: async (videoIds) => {
    const { videos, configs } = useVideoLibraryStore.getState();
    const videosToEstimate = videoIds
      ? videos.filter(v => videoIds.includes(v.id) && v.uploadedPath)
      : videos.filter(v => v.uploadedPath);
    const cfgs = videosToEstimate
      .map(v => buildAnalysisConfig(v, configs[v.id]));

    set({ isEstimating: true, isEstimateModalOpen: true });
    try {
      const data = await videoApi.estimateTokens(cfgs);
      set({ estimateData: data });
    } catch (err) {
      console.error('Estimation failed:', err);
    } finally {
      set({ isEstimating: false });
    }
  },

  runAnalysis: async (videoIds) => {
    set({ isAnalyzing: true, analysisProgress: 0 });
    const { videos, configs } = useVideoLibraryStore.getState();

    const videosToAnalyze = videoIds
      ? videos.filter(v => videoIds.includes(v.id) && v.uploadedPath)
      : videos.filter(v => v.uploadedPath);

    const cfgs = videosToAnalyze.map(v => buildAnalysisConfig(v, configs[v.id]));

    try {
      const progressInterval = setInterval(() => {
        set(s => ({ analysisProgress: Math.min(s.analysisProgress + 5, 90) }));
      }, 500);

      const apiResults = await videoApi.analyzeVideos(cfgs);
      clearInterval(progressInterval);
      set({ analysisProgress: 100 });

      const newResults: Record<string, AnalysisResult> = {};
      apiResults.forEach((result: AnalysisResult, i: number) => {
        const vid = videosToAnalyze[i];
        if (vid) newResults[vid.id] = result;
      });

      useVideoLibraryStore.getState().setResults(newResults);

      // Auto-generate embeddings for search (fire-and-forget)
      for (const [videoId, result] of Object.entries(newResults)) {
        if (result.frames && result.frames.length > 0) {
          videoApi.generateEmbeddings(videoId, result.frames)
            .then(() => console.log(`Embeddings generated for ${videoId}`))
            .catch(err => console.error(`Embedding generation failed for ${videoId}:`, err));
        }
      }
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));
