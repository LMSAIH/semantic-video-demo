import { useState, useRef, useEffect } from 'react';
import { Upload, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PartitionTimeline } from './PartitionTimeline';
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
  if (!currentVideo) {
    return (
      <div 
        className={`flex-1 flex items-center justify-center bg-muted/30 transition-colors ${
          isDragging ? 'bg-primary/5' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="text-center max-w-md">
          <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No Video Selected</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Drag and drop videos here or click to browse
          </p>
          <Label htmlFor="file-upload-center" className="cursor-pointer text-center block">
            <Button asChild>
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
      <div className="flex-1 bg-black/95 flex items-center justify-center relative min-h-0">
        <video
          ref={videoRef}
          src={currentVideo.file ? URL.createObjectURL(currentVideo.file) : undefined}
          controls
          className="max-h-full max-w-full"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Analyzing video...</p>
              <Progress value={analysisProgress} className="w-64 mt-4" />
              <p className="text-sm mt-2 opacity-75">{analysisProgress}% complete</p>
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
