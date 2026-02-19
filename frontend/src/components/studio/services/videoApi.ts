import axios from 'axios';
import type { AnalysisResult, AnalysisConfig, Model, ComposerPreset, Composition } from '../types';
import { API_BASE } from '../types';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/* ------------------------------------------------------------------ */
/*  Response types                                                     */
/* ------------------------------------------------------------------ */

export interface UploadResponse {
  files: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
  }>;
}

export interface TokenEstimate {
  totalTokens: number;
  estimatedCost: number;
}

export interface VideoEstimate {
  videoPath: string;
  model: string;
  numPartitions: number;
  perFrame: TokenEstimate;
  total: TokenEstimate;
}

export interface EstimateResponse {
  message: string;
  videosEstimated: number;
  videos: VideoEstimate[];
  grandTotal: {
    totalTokens: number;
    estimatedCost: number;
  };
  elapsedTime: string;
}

export interface AnalyzeResponse {
  results: AnalysisResult[];
}

/** Shape returned by GET /videos and GET /videos/:id */
export interface VideoFromServer {
  id: string;
  name: string;
  size: string;
  duration: number | null;
  uploadedPath: string | null;
  createdAt: string;
  config: AnalysisConfig | null;
  result: AnalysisResult | null;
}

/* ------------------------------------------------------------------ */
/*  Models (read-only — sourced from semantic-video package)            */
/* ------------------------------------------------------------------ */

export async function fetchModels(): Promise<Model[]> {
  const { data } = await api.get<{ details: Model[]; models: string[] }>('/models');
  if (data.details) return data.details;
  return (data.models ?? []).map((id: string) => ({ id, name: id, provider: 'OpenAI' }));
}

/* ------------------------------------------------------------------ */
/*  File upload                                                        */
/* ------------------------------------------------------------------ */

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('videos', file);
  const { data } = await api.post<UploadResponse>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/* ------------------------------------------------------------------ */
/*  Videos CRUD (backed by SQLite)                                     */
/* ------------------------------------------------------------------ */

export async function fetchVideos(): Promise<VideoFromServer[]> {
  const { data } = await api.get<{ videos: VideoFromServer[] }>('/videos');
  return data.videos ?? [];
}

export async function fetchVideo(id: string): Promise<VideoFromServer> {
  const { data } = await api.get<VideoFromServer>(`/videos/${id}`);
  return data;
}

export async function createVideoRecord(body: {
  id: string;
  name: string;
  size: string;
  duration?: number;
  uploadedPath?: string;
  config?: Partial<AnalysisConfig>;
}): Promise<VideoFromServer> {
  const { data } = await api.post<VideoFromServer>('/videos', body);
  return data;
}

export async function updateVideoRecord(id: string, body: {
  name?: string;
  size?: string;
  duration?: number;
  uploadedPath?: string;
  config?: Partial<AnalysisConfig>;
  result?: AnalysisResult;
}): Promise<VideoFromServer> {
  const { data } = await api.patch<VideoFromServer>(`/videos/${id}`, body);
  return data;
}

export async function deleteVideoRecord(id: string): Promise<void> {
  await api.delete(`/videos/${id}`);
}

/* ------------------------------------------------------------------ */
/*  Analysis & estimation                                              */
/* ------------------------------------------------------------------ */

export async function estimateTokens(
  configs: Array<{
    videoPath: string | undefined;
    model: string;
    numPartitions: number;
    prompt: string;
    detail: string;
  }>,
): Promise<EstimateResponse> {
  const { data } = await api.post<EstimateResponse>('/analyze/estimate', { configs });
  return data;
}

export async function analyzeVideos(
  configs: Array<{
    videoPath: string | undefined;
    model: string;
    numPartitions: number;
    prompt: string;
    detail: string;
  }>,
): Promise<AnalysisResult[]> {
  const { data } = await api.post<AnalyzeResponse>('/analyze', { configs });
  return data.results || [];
}

/* ------------------------------------------------------------------ */
/*  Semantic search                                                    */
/* ------------------------------------------------------------------ */

export interface SearchResultItem {
  videoId: string;
  videoName: string;
  frameNumber: number;
  timestamp: number;
  description: string;
  similarity: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  count: number;
}

export async function semanticSearch(
  query: string,
  threshold: number = 0.3,
  limit: number = 20,
): Promise<SearchResultItem[]> {
  const { data } = await api.post<SearchResponse>('/search', { query, threshold, limit });
  return data.results ?? [];
}

export async function generateEmbeddings(
  videoId: string,
  frames: Array<{ frameNumber: number; timestamp: number; description: string }>,
): Promise<{ count: number }> {
  const { data } = await api.post<{ count: number }>('/search/generate', { videoId, frames });
  return data;
}

export async function deleteEmbeddings(videoId: string): Promise<void> {
  await api.delete(`/search/embeddings/${videoId}`);
}

export async function getEmbeddingStatus(videoId: string): Promise<boolean> {
  const { data } = await api.get<{ hasEmbeddings: boolean }>(`/search/status/${videoId}`);
  return data.hasEmbeddings;
}

/* ------------------------------------------------------------------ */
/*  Composer                                                           */
/* ------------------------------------------------------------------ */

export async function fetchPresets(): Promise<ComposerPreset[]> {
  const { data } = await api.get<{ presets: ComposerPreset[] }>('/composer/presets');
  return data.presets ?? [];
}

export async function fetchCompositions(videoId: string): Promise<Composition[]> {
  const { data } = await api.get<{ compositions: Composition[] }>(`/composer/${videoId}`);
  return data.compositions ?? [];
}

export async function generateComposition(
  videoId: string,
  preset: string,
): Promise<Composition> {
  const { data } = await api.post<{ composition: Composition }>('/composer/generate', {
    videoId,
    preset,
  });
  return data.composition;
}

export async function deleteComposition(id: string): Promise<void> {
  await api.delete(`/composer/composition/${id}`);
}
