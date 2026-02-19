import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoFile, AnalysisConfig, AnalysisResult, Model } from '../types';
import type { EstimateResponse } from '../services/videoApi';
import * as videoApi from '../services/videoApi';
import {
  filterVideoFiles,
  createVideoFile,
  calculatePartitions,
  buildAnalysisConfig,
} from '../utils/videoHelpers';

/* ------------------------------------------------------------------ */
/*  State shape                                                        */
/* ------------------------------------------------------------------ */

interface VideoStudioState {
  // Persisted state
  videos: VideoFile[];
  selectedVideo: string | null;
  configs: Record<string, AnalysisConfig>;
  results: Record<string, AnalysisResult>;

  // Session-only state (not persisted)
  models: Model[];
  isAnalyzing: boolean;
  analysisProgress: number;
  estimateData: EstimateResponse | null;
  isEstimateModalOpen: boolean;
  isEstimating: boolean;
  isVideoSelectionModalOpen: boolean;
  isDragging: boolean;
  uploadError: string | null;
  isUploading: boolean;
}

interface VideoStudioActions {
  // Initialization
  fetchModels: () => Promise<void>;

  // Library actions
  setSelectedVideo: (id: string | null) => void;
  addVideo: (videoFile: VideoFile, config: AnalysisConfig) => void;
  updateVideoDuration: (videoId: string, duration: number, updatedPartitions: number) => void;
  removeVideo: (id: string) => void;
  updateConfig: (videoId: string, updates: Partial<AnalysisConfig>) => void;

  // Upload actions
  setIsDragging: (v: boolean) => void;
  clearUploadError: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
  handleFileDrop: (e: React.DragEvent) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;

  // Analysis actions
  setIsEstimateModalOpen: (v: boolean) => void;
  setIsVideoSelectionModalOpen: (v: boolean) => void;
  estimateTokens: () => Promise<void>;
  runAnalysis: (videoIds?: string[]) => Promise<void>;
  showVideoSelectionModal: () => void;
}

export type VideoStudioStore = VideoStudioState & VideoStudioActions;

/* ------------------------------------------------------------------ */
/*  Derived selectors (call outside of the store for convenience)      */
/* ------------------------------------------------------------------ */

export const selectCurrentVideo = (state: VideoStudioStore) =>
  state.videos.find(v => v.id === state.selectedVideo);

export const selectCurrentConfig = (state: VideoStudioStore) =>
  state.selectedVideo ? state.configs[state.selectedVideo] ?? null : null;

export const selectCurrentResult = (state: VideoStudioStore) =>
  state.selectedVideo ? state.results[state.selectedVideo] ?? null : null;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useVideoStudioStore = create<VideoStudioStore>()(
  persist(
    (set, get) => ({
      /* ---------- persisted state ---------- */
      videos: [],
      selectedVideo: null,
      configs: {},
      results: {},

      /* ---------- session-only state ---------- */
      models: [],
      isAnalyzing: false,
      analysisProgress: 0,
      estimateData: null,
      isEstimateModalOpen: false,
      isEstimating: false,
      isVideoSelectionModalOpen: false,
      isDragging: false,
      uploadError: null,
      isUploading: false,

      /* ---------- initialization ---------- */
      fetchModels: async () => {
        try {
          const models = await videoApi.fetchModels();
          set({ models });
        } catch (err) {
          console.error('Failed to fetch models:', err);
        }
      },

      /* ---------- library actions ---------- */
      setSelectedVideo: (id) => set({ selectedVideo: id }),

      addVideo: (videoFile, config) => {
        const { videos, configs, selectedVideo } = get();
        if (videos.find(v => v.id === videoFile.id)) {
          console.warn('Video with same ID already exists!', videoFile.id);
          return;
        }
        set({
          videos: [...videos, videoFile],
          configs: { ...configs, [videoFile.id]: config },
          selectedVideo: selectedVideo || videoFile.id,
        });
      },

      updateVideoDuration: (videoId, duration, updatedPartitions) => {
        const { videos, configs } = get();
        set({
          videos: videos.map(v => (v.id === videoId ? { ...v, duration } : v)),
          configs: {
            ...configs,
            ...(configs[videoId]
              ? { [videoId]: { ...configs[videoId], numPartitions: updatedPartitions } }
              : {}),
          },
        });
      },

      removeVideo: (id) => {
        const { videos, selectedVideo, configs, results } = get();
        const remaining = videos.filter(v => v.id !== id);
        const newConfigs = { ...configs };
        delete newConfigs[id];
        const newResults = { ...results };
        delete newResults[id];

        set({
          videos: remaining,
          selectedVideo: selectedVideo === id ? (remaining[0]?.id || null) : selectedVideo,
          configs: newConfigs,
          results: newResults,
        });
      },

      updateConfig: (videoId, updates) => {
        const { configs } = get();
        const existing = configs[videoId];
        if (existing) {
          set({ configs: { ...configs, [videoId]: { ...existing, ...updates } } });
        }
      },

      /* ---------- upload actions ---------- */
      setIsDragging: (v) => set({ isDragging: v }),
      clearUploadError: () => set({ uploadError: null }),

      uploadFiles: async (files) => {
        set({ uploadError: null, isUploading: true });
        const { models } = get();

        for (const file of files) {
          try {
            const data = await videoApi.uploadFile(file);
            if (data.files && data.files.length > 0) {
              const uploadedFile = data.files[0];
              const { videoFile, config } = createVideoFile(
                file,
                uploadedFile.path,
                models[0]?.id || 'gpt-5-nano',
              );

              get().addVideo(videoFile, config);

              // Load video metadata (duration)
              const video = document.createElement('video');
              video.preload = 'metadata';

              const metadataTimeout = setTimeout(() => {
                console.warn('Video metadata loading timeout:', file.name);
                URL.revokeObjectURL(video.src);
              }, 5000);

              video.onloadedmetadata = () => {
                clearTimeout(metadataTimeout);
                const dur = video.duration;
                URL.revokeObjectURL(video.src);
                if (isFinite(dur) && dur > 0) {
                  const partitions = calculatePartitions(config, dur);
                  get().updateVideoDuration(videoFile.id, dur, partitions);
                } else {
                  console.warn('Invalid video duration:', dur);
                }
              };

              video.onerror = (err) => {
                clearTimeout(metadataTimeout);
                console.error('Error loading video metadata:', err, file.name);
                URL.revokeObjectURL(video.src);
              };

              video.src = URL.createObjectURL(file);
              video.load();
            }
          } catch (error: any) {
            console.error('Upload failed:', error);
            const msg =
              error.response?.data?.error ||
              error.response?.data?.message ||
              error.message ||
              'Upload failed. Please try again.';
            set({ uploadError: msg, isUploading: false });
            return;
          }
        }
        set({ isUploading: false });
      },

      handleFileDrop: async (e) => {
        e.preventDefault();
        set({ isDragging: false });
        const files = filterVideoFiles(e.dataTransfer.files);
        await get().uploadFiles(files);
      },

      handleFileSelect: async (e) => {
        const files = filterVideoFiles(e.target.files || []);
        await get().uploadFiles(files);
      },

      /* ---------- analysis actions ---------- */
      setIsEstimateModalOpen: (v) => set({ isEstimateModalOpen: v }),
      setIsVideoSelectionModalOpen: (v) => set({ isVideoSelectionModalOpen: v }),

      showVideoSelectionModal: () => set({ isVideoSelectionModalOpen: true }),

      estimateTokens: async () => {
        const { videos, configs } = get();
        const cfgs = videos
          .filter(v => v.uploadedPath)
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
        const { videos, configs } = get();

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

          const newResults = { ...get().results };
          apiResults.forEach((result: AnalysisResult, i: number) => {
            const vid = videosToAnalyze[i];
            if (vid) newResults[vid.id] = result;
          });
          set({ results: newResults });
        } catch (err) {
          console.error('Analysis failed:', err);
        } finally {
          set({ isAnalyzing: false });
        }
      },
    }),
    {
      name: 'video-studio-storage',
      partialize: (state) => ({
        videos: state.videos.map(({ file: _file, ...rest }) => rest),
        selectedVideo: state.selectedVideo,
        configs: state.configs,
        results: state.results,
      }),
    },
  ),
);
