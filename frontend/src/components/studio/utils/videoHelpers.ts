import type { VideoFile, AnalysisConfig } from '../types';

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Filter video files from a list of files
 */
export function filterVideoFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter(f => f.type.startsWith('video/'));
}

/**
 * Create a VideoFile object from a File and upload response
 */
export function createVideoFile(
  file: File,
  uploadedPath: string,
  defaultModel: string
): { videoFile: VideoFile; config: AnalysisConfig } {
  const videoFile: VideoFile = {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    size: formatFileSize(file.size),
    uploadedPath,
    duration: undefined, // Will be set when video metadata loads
  };

  const config: AnalysisConfig = {
    videoId: videoFile.id,
    model: defaultModel || 'gpt-5-nano',
    partitionType: 'time',
    partitionInterval: 2, // Default: every 2 seconds
    frameRate: 60, // Default frame rate
    numPartitions: 10, // Default fallback
    prompt: 'Describe what is happening in this frame in detail.',
    detail: 'auto',
  };

  return { videoFile, config };
}

/**
 * Calculate number of partitions based on config and video metadata
 */
export function calculatePartitions(
  config: AnalysisConfig,
  videoDuration?: number
): number {
  if (!videoDuration || videoDuration === 0) {
    return 10; // Default fallback
  }

  if (config.partitionType === 'time') {
    // Partition by time (seconds)
    const partitions = Math.ceil(videoDuration / config.partitionInterval);
    return Math.max(1, partitions); 
  } else {
    // Partition by frames
    const totalFrames = Math.floor(videoDuration * config.frameRate);
    const partitions = Math.ceil(totalFrames / config.partitionInterval);
    return Math.max(1, partitions); 
  }
}

/**
 * Build analysis config from video and config state
 */
export function buildAnalysisConfig(
  video: VideoFile,
  config?: AnalysisConfig
) {
  // Always recalculate partitions based on current video duration
  const numPartitions = config 
    ? calculatePartitions(config, video.duration)
    : 10;

  return {
    videoPath: video.uploadedPath,
    model: config?.model || 'gpt-5-nano',
    numPartitions,
    prompt: config?.prompt || 'Describe this frame.',
    detail: config?.detail || 'auto',
  };
}
