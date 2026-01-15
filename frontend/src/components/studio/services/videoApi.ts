import axios from 'axios';
import type { AnalysisResult, Model } from '../types';
import { API_BASE } from '../types';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UploadResponse {
  files: Array<{
    filename: string;
    originalName: string;
    path: string;
    size: number;
  }>;
}

export interface ModelsResponse {
  models: string[];
}

export interface EstimateRequest {
  configs: Array<{
    videoPath: string | undefined;
    model: string;
    numPartitions: number;
    prompt: string;
    detail: string;
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

export interface AnalyzeRequest {
  configs: Array<{
    videoPath: string | undefined;
    model: string;
    numPartitions: number;
    prompt: string;
    detail: string;
  }>;
}

export interface AnalyzeResponse {
  results: AnalysisResult[];
}

/**
 * Fetch available AI models
 */
export async function fetchModels(): Promise<Model[]> {
  const { data } = await api.get<ModelsResponse>('/models');
  const modelList = data.models || [];
  
  return modelList.map((modelId: string) => ({
    id: modelId,
    name: modelId,
    provider: 'OpenAI', 
  }));
}

/**
 * Upload video files
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('videos', file);
  
  const { data } = await api.post<UploadResponse>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data;
}

/**
 * Estimate token usage for video analysis
 */
export async function estimateTokens(configs: EstimateRequest['configs']): Promise<EstimateResponse> {
  const { data } = await api.post<EstimateResponse>('/analyze/estimate', { configs });
  return data;
}

/**
 * Analyze videos with AI
 */
export async function analyzeVideos(configs: AnalyzeRequest['configs']): Promise<AnalysisResult[]> {
  const { data } = await api.post<AnalyzeResponse>('/analyze', { configs });
  return data.results || [];
}
