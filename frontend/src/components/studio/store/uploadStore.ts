import { create } from 'zustand';
import * as videoApi from '../services/videoApi';
import {
  filterVideoFiles,
  createVideoFile,
  calculatePartitions,
} from '../utils/videoHelpers';
import { useVideoLibraryStore } from './videoLibraryStore';
import { useModelStore } from './modelStore';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

interface UploadState {
  isDragging: boolean;
  uploadError: string | null;
  isUploading: boolean;
}

interface UploadActions {
  setIsDragging: (v: boolean) => void;
  clearUploadError: () => void;
  uploadFiles: (files: File[]) => Promise<void>;
  handleFileDrop: (e: React.DragEvent) => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export type UploadStore = UploadState & UploadActions;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useUploadStore = create<UploadStore>()((set, get) => ({
  isDragging: false,
  uploadError: null,
  isUploading: false,

  setIsDragging: (v) => set({ isDragging: v }),
  clearUploadError: () => set({ uploadError: null }),

  uploadFiles: async (files) => {
    set({ uploadError: null, isUploading: true });
    const models = useModelStore.getState().models;

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

          // Use fresh reference to addVideo (in case other uploads mutated state)
          useVideoLibraryStore.getState().addVideo(videoFile, config);

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
              useVideoLibraryStore.getState().updateVideoDuration(videoFile.id, dur, partitions);
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
}));
