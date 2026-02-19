import { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PartitionTimeline } from './PartitionTimeline';
import { getVideoSrc } from '../utils/videoHelpers';
import { useVideoLibraryStore } from '../store/videoLibraryStore';
import type { VideoFile, AnalysisResult, AnalysisConfig } from '../types';

interface VideoPreviewProps {
  currentVideo: VideoFile | undefined;
  currentConfig: AnalysisConfig | null;
  currentResult: AnalysisResult | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError?: string | null;
  isUploading?: boolean;
  onClearError?: () => void;
}

export function VideoPreview({
  currentVideo,
  currentConfig,
  isAnalyzing,
  analysisProgress,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  uploadError: _uploadError,
  isUploading: _isUploading,
  onClearError: _onClearError,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoSrc = useMemo(() => currentVideo ? getVideoSrc(currentVideo) : undefined, [currentVideo]);

  // Update current time as video plays
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentVideo]);

  // Listen for seek requests from the store (e.g. clicking frames in OutputPanel)
  const seekTimestamp = useVideoLibraryStore(s => s.seekTimestamp);
  const clearSeek = useVideoLibraryStore(s => s.clearSeek);

  useEffect(() => {
    if (seekTimestamp !== null && videoRef.current) {
      videoRef.current.currentTime = seekTimestamp;
      clearSeek();
    }
  }, [seekTimestamp, clearSeek]);

  if (!currentVideo) {
    return (
      <div 
        className={`flex-1 flex items-center justify-center bg-muted/20 transition-all duration-300 ${
          isDragging ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="text-center max-w-sm">
          <div className="h-20 w-20 rounded-3xl bg-muted/40 flex items-center justify-center mx-auto mb-5">
            <Video className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight mb-1.5">No Video Selected</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Drag and drop videos here or browse to upload
          </p>
          <Label htmlFor="file-upload-center" className="cursor-pointer text-center block">
            <Button asChild className="rounded-xl h-10 px-6 text-[13px] font-medium apple-shadow">
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </span>
            </Button>
            <Input
              id="file-upload-center"
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              onChange={onFileSelect}
            />
          </Label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Video Preview */}
      <div className="flex-1 bg-black flex items-center justify-center relative min-h-0">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          className="max-h-full max-w-full"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white">
              <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <p className="text-[17px] font-semibold tracking-tight">Analyzing video...</p>
              <Progress value={analysisProgress} className="w-56 mt-4" />
              <p className="text-sm mt-2.5 text-white/70">{analysisProgress}% complete</p>
            </div>
          </div>
        )}
      </div>

      {/* Partition Timeline */}
      {currentConfig && currentVideo.duration && (
        <PartitionTimeline
          video={currentVideo}
          config={currentConfig}
          videoRef={videoRef}
          currentTime={currentTime}
        />
      )}

    </div>
  );
}
