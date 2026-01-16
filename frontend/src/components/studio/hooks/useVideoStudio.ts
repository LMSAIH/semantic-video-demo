import { useState, useCallback, useEffect } from 'react';
import type { VideoFile, AnalysisConfig, AnalysisResult, Model } from '../types';
import * as videoApi from '../services/videoApi';
import { filterVideoFiles, createVideoFile, buildAnalysisConfig, calculatePartitions } from '../utils/videoHelpers';

export function useVideoStudio() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [configs, setConfigs] = useState<Map<string, AnalysisConfig>>(new Map());
  const [results, setResults] = useState<Map<string, AnalysisResult>>(new Map());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [estimateData, setEstimateData] = useState<videoApi.EstimateResponse | null>(null);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isVideoSelectionModalOpen, setIsVideoSelectionModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch available models on mount
  useEffect(() => {
    videoApi.fetchModels()
      .then(setModels)
      .catch(err => console.error('Failed to fetch models:', err));
  }, []);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  const uploadFiles = useCallback(async (files: File[]) => {
    setUploadError(null);
    setIsUploading(true);
    
    for (const file of files) {
      try {
        const data = await videoApi.uploadVideo(file);
        
        if (data.files && data.files.length > 0) {
          const uploadedFile = data.files[0];
          const { videoFile, config } = createVideoFile(
            file,
            uploadedFile.path,
            models[0]?.id || 'gpt-5-nano'
          );

          
          // Add video and config immediately
          setVideos(prev => {
            const exists = prev.find(v => v.id === videoFile.id);
            if (exists) {
              console.warn('Video with same ID already exists!', videoFile.id);
              return prev;
            }
            return [...prev, videoFile];
          });
          setConfigs(prev => new Map(prev).set(videoFile.id, config));
          setSelectedVideo(prev => prev || videoFile.id);
          
          // Load video metadata (duration) from the file
          const video = document.createElement('video');
          video.preload = 'metadata';
          
          // Timeout fallback if metadata doesn't load (e.g., unsupported formats like WMV)
          const metadataTimeout = setTimeout(() => {
            console.warn('Video metadata loading timeout - format may not be supported in browser:', file.name);
            URL.revokeObjectURL(video.src);
          }, 5000);
          
          video.onloadedmetadata = () => {
            clearTimeout(metadataTimeout);
            const duration = video.duration;
            
            URL.revokeObjectURL(video.src);
            
            if (isFinite(duration) && duration > 0) {
              // Update video file with duration
              setVideos(prev => {
                const updated = prev.map(v => 
                  v.id === videoFile.id ? { ...v, duration } : v
                );
                return updated;
              });
              
              // Recalculate partitions with actual duration
              const updatedPartitions = calculatePartitions(config, duration);
              setConfigs(prev => {
                const newMap = new Map(prev);
                const currentConfig = newMap.get(videoFile.id);
                if (currentConfig) {
                  newMap.set(videoFile.id, { ...currentConfig, numPartitions: updatedPartitions });
                }
                return newMap;
              });
            } else {
              console.warn('Invalid video duration:', duration);
            }
          };
          
          video.onerror = (error) => {
            clearTimeout(metadataTimeout);
            console.error('Error loading video metadata:', error, file.name);
            URL.revokeObjectURL(video.src);
          };
          
          // Set src after event handlers are attached
          video.src = URL.createObjectURL(file);
          video.load(); // Explicitly trigger load
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
        const errorMessage = error.response?.data?.error 
          || error.response?.data?.message 
          || error.message 
          || 'Upload failed. Please try again.';
        setUploadError(errorMessage);
        setIsUploading(false);
        return;
      }
    }
    setIsUploading(false);
  }, [models]);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = filterVideoFiles(e.dataTransfer.files);
    await uploadFiles(files);
  }, [uploadFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = filterVideoFiles(e.target.files || []);
    await uploadFiles(files);
  }, [uploadFiles]);

  const removeVideo = useCallback((id: string) => {
    setVideos(prev => {
      const remaining = prev.filter(v => v.id !== id);
      // Update selected video if needed
      if (selectedVideo === id) {
        setSelectedVideo(remaining[0]?.id || null);
      }
      return remaining;
    });
    setConfigs(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    setResults(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, [selectedVideo]);

  const updateConfig = useCallback((videoId: string, updates: Partial<AnalysisConfig>) => {
    setConfigs(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(videoId);
      if (existing) {
        newMap.set(videoId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  const estimateTokens = useCallback(async () => {
    const configsToEstimate = videos
      .filter(v => v.uploadedPath)
      .map(v => buildAnalysisConfig(v, configs.get(v.id)));

    setIsEstimating(true);
    setIsEstimateModalOpen(true);
    try {
      const data = await videoApi.estimateTokens(configsToEstimate);
      setEstimateData(data);
    } catch (error) {
      console.error('Estimation failed:', error);
    } finally {
      setIsEstimating(false);
    }
  }, [videos, configs]);

  const runAnalysis = useCallback(async (videoIds?: string[]) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    const videosToAnalyze = videoIds 
      ? videos.filter(v => videoIds.includes(v.id) && v.uploadedPath)
      : videos.filter(v => v.uploadedPath);

    const configsToAnalyze = videosToAnalyze
      .map(v => buildAnalysisConfig(v, configs.get(v.id)));

    try {
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const results = await videoApi.analyzeVideos(configsToAnalyze);

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      setResults(prev => {
        const newResults = new Map(prev);
        results.forEach((result: AnalysisResult, index: number) => {
          const video = videosToAnalyze[index];
          if (video) {
            newResults.set(video.id, result);
          }
        });
        return newResults;
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [videos, configs]);

  const showVideoSelectionModal = useCallback(() => {
    setIsVideoSelectionModalOpen(true);
  }, []);

  const currentVideo = videos.find(v => v.id === selectedVideo);
  const currentConfig = selectedVideo ? configs.get(selectedVideo) ?? null : null;
  const currentResult = selectedVideo ? results.get(selectedVideo) ?? null : null;

  return {
    // State
    videos,
    selectedVideo,
    models,
    configs,
    results,
    isAnalyzing,
    analysisProgress,
    estimateData,
    isEstimateModalOpen,
    isEstimating,
    isVideoSelectionModalOpen,
    isDragging,
    currentVideo,
    currentConfig,
    currentResult,
    uploadError,
    isUploading,
    
    // Actions
    setSelectedVideo,
    setIsDragging,
    setIsEstimateModalOpen,
    setIsVideoSelectionModalOpen,
    handleFileDrop,
    handleFileSelect,
    removeVideo,
    updateConfig,
    estimateTokens,
    showVideoSelectionModal,
    runAnalysis,
    clearUploadError,
  };
}
