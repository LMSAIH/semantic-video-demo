import { create } from 'zustand';
import type { VideoFile, AnalysisConfig, AnalysisResult } from '../types';
import * as videoApi from '../services/videoApi';
import type { VideoFromServer } from '../services/videoApi';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface VideoLibraryState {
  videos: VideoFile[];
  selectedVideo: string | null;
  configs: Record<string, AnalysisConfig>;
  results: Record<string, AnalysisResult>;
  isLoading: boolean;
  /** When set, the video player should seek to this timestamp */
  seekTimestamp: number | null;
}

interface VideoLibraryActions {
  loadVideos: () => Promise<void>;
  setSelectedVideo: (id: string | null) => void;
  addVideo: (videoFile: VideoFile, config: AnalysisConfig) => void;
  updateVideoDuration: (videoId: string, duration: number, updatedPartitions: number) => void;
  removeVideo: (id: string) => void;
  updateConfig: (videoId: string, updates: Partial<AnalysisConfig>) => void;
  setResult: (videoId: string, result: AnalysisResult) => void;
  setResults: (results: Record<string, AnalysisResult>) => void;
  /** Request the video player to seek to a specific timestamp */
  seekTo: (timestamp: number) => void;
  /** Clear the seek request after it's been consumed */
  clearSeek: () => void;
}

export type VideoLibraryStore = VideoLibraryState & VideoLibraryActions;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function serverVideoToLocal(v: VideoFromServer): VideoFile {
  return {
    id: v.id,
    name: v.name,
    size: v.size,
    duration: v.duration ?? undefined,
    uploadedPath: v.uploadedPath ?? undefined,
  };
}

function serverConfigToLocal(v: VideoFromServer): AnalysisConfig | null {
  if (!v.config) return null;
  return v.config;
}

/* ------------------------------------------------------------------ */
/*  Selectors                                                          */
/* ------------------------------------------------------------------ */

export const selectCurrentVideo = (state: VideoLibraryStore) =>
  state.videos.find(v => v.id === state.selectedVideo);

export const selectCurrentConfig = (state: VideoLibraryStore) =>
  state.selectedVideo ? state.configs[state.selectedVideo] ?? null : null;

export const selectCurrentResult = (state: VideoLibraryStore) =>
  state.selectedVideo ? state.results[state.selectedVideo] ?? null : null;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useVideoLibraryStore = create<VideoLibraryStore>()((set, get) => ({
  videos: [],
  selectedVideo: null,
  configs: {},
  results: {},
  isLoading: false,
  seekTimestamp: null,

  loadVideos: async () => {
    set({ isLoading: true });
    try {
      const serverVideos = await videoApi.fetchVideos();
      const videos: VideoFile[] = [];
      const configs: Record<string, AnalysisConfig> = {};
      const results: Record<string, AnalysisResult> = {};

      for (const sv of serverVideos) {
        videos.push(serverVideoToLocal(sv));
        const cfg = serverConfigToLocal(sv);
        if (cfg) configs[sv.id] = cfg;
        if (sv.result) results[sv.id] = sv.result;
      }

      set({
        videos,
        configs,
        results,
        selectedVideo: get().selectedVideo ?? videos[0]?.id ?? null,
      });
    } catch (err) {
      console.error('Failed to load videos from server:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedVideo: (id) => set({ selectedVideo: id }),

  addVideo: (videoFile, config) => {
    const { videos, configs, selectedVideo } = get();
    if (videos.find(v => v.id === videoFile.id)) {
      console.warn('Video with same ID already exists!', videoFile.id);
      return;
    }

    // Persist to server (fire-and-forget)
    videoApi.createVideoRecord({
      id: videoFile.id,
      name: videoFile.name,
      size: videoFile.size,
      duration: videoFile.duration,
      uploadedPath: videoFile.uploadedPath,
      config,
    }).catch(err => console.error('Failed to persist video to server:', err));

    set({
      videos: [...videos, videoFile],
      configs: { ...configs, [videoFile.id]: config },
      selectedVideo: selectedVideo || videoFile.id,
    });
  },

  updateVideoDuration: (videoId, duration, updatedPartitions) => {
    const { videos, configs } = get();

    // Sync to server
    videoApi.updateVideoRecord(videoId, {
      duration,
      ...(configs[videoId] ? { config: { numPartitions: updatedPartitions } } : {}),
    }).catch(err => console.error('Failed to sync duration:', err));

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

    // Delete from server (also cleans up the file on disk)
    videoApi.deleteVideoRecord(id).catch(err => console.error('Failed to delete video:', err));

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
    if (!existing) return;
    const updated = { ...existing, ...updates };

    // Sync config to server
    videoApi.updateVideoRecord(videoId, { config: updates })
      .catch(err => console.error('Failed to sync config:', err));

    set({ configs: { ...configs, [videoId]: updated } });
  },

  setResult: (videoId, result) => {
    // Persist result to server
    videoApi.updateVideoRecord(videoId, { result })
      .catch(err => console.error('Failed to persist result:', err));

    set({ results: { ...get().results, [videoId]: result } });
  },

  setResults: (results) => {
    // Persist each result to server
    for (const [videoId, result] of Object.entries(results)) {
      videoApi.updateVideoRecord(videoId, { result })
        .catch(err => console.error('Failed to persist result:', err));
    }

    set({ results: { ...get().results, ...results } });
  },

  seekTo: (timestamp) => set({ seekTimestamp: timestamp }),
  clearSeek: () => set({ seekTimestamp: null }),
}));
