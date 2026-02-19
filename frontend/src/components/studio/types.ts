export interface VideoFile {
  id: string;
  file?: File; // Only available during the current session (not persisted)
  name: string;
  size: string;
  duration?: number; // Duration in seconds
  thumbnail?: string;
  uploadedPath?: string;
}

export interface AnalysisConfig {
  videoId: string;
  model: string;
  partitionType: 'time' | 'frames'; // Partition by time or frame count
  partitionInterval: number; // Seconds or frame count
  frameRate: number; // Frame rate for frame-based partition calculation
  numPartitions?: number; // Calculated partitions (sent to backend)
  prompt: string;
  detail: 'low' | 'high' | 'auto';
}

export interface FrameResult {
  frameNumber: number;
  timestamp: number;
  description: string;
}

export interface AnalysisResult {
  videoPath: string;
  totalFrames: number;
  frames: FrameResult[];
}

export interface Model {
  id: string;
  name: string;
  provider: string;
}

export interface ComposerPreset {
  id: string;
  name: string;
  description: string;
}

export interface Composition {
  id: string;
  videoId: string;
  preset: string;
  model: string;
  content: string;
  createdAt: string;
}

export const API_BASE = 'http://localhost:3000';
