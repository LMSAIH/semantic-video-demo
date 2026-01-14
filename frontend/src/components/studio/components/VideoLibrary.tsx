import { Layers, Trash2, Plus, Video, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadDialog } from './UploadDialog';
import type { VideoFile } from '../types';

interface VideoLibraryProps {
  videos: VideoFile[];
  selectedVideo: string | null;
  results: Map<string, unknown>;
  isDragging: boolean;
  onSelectVideo: (id: string) => void;
  onRemoveVideo: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError?: string | null;
  isUploading?: boolean;
  onClearError?: () => void;
}

export function VideoLibrary({
  videos,
  selectedVideo,
  results,
  isDragging,
  onSelectVideo,
  onRemoveVideo,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  uploadError,
  isUploading,
  onClearError,
}: VideoLibraryProps) {
  return (
    <div className="w-64 shrink-0 h-full flex flex-col border-r bg-card/50">
      <div className="p-3 border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Video Library
          </h3>
          <UploadDialog
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            }
            isDragging={isDragging}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileSelect={onFileSelect}
            inputId="file-upload-sidebar"
            error={uploadError}
            isUploading={isUploading}
            onClearError={onClearError}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileVideo className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No videos uploaded</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                  selectedVideo === video.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectVideo(video.id)}
              >
                <div className="h-10 w-14 bg-muted rounded flex items-center justify-center shrink-0">
                  <Video className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{video.name}</p>
                  <p className="text-xs text-muted-foreground">{video.size}</p>
                </div>
                {results.has(video.id) && (
                  <Badge variant="secondary" className="text-xs">
                    Done
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveVideo(video.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

    </div>
  );
}
