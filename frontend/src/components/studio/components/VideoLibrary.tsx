import { Trash2, Plus, Video, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadDialog } from './UploadDialog';
import { SearchPanel } from './SearchPanel';
import type { VideoFile } from '../types';

interface VideoLibraryProps {
  videos: VideoFile[];
  selectedVideo: string | null;
  results: Record<string, unknown>;
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
    <div className="w-64 shrink-0 h-full flex flex-col border-r apple-divider glass-subtle">
      {/* Header */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm tracking-tight text-foreground">
            Library
          </h3>
          <UploadDialog
            trigger={
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted/60">
                <Plus className="h-3.5 w-3.5" />
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

      {/* Semantic Search */}
      <div className="shrink-0 overflow-hidden flex flex-col max-h-[50%]">
        <SearchPanel />
      </div>

      <div className="h-px bg-border/50 mx-3 shrink-0" />

      {/* Video list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-0.5">
          {videos.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
                <FileVideo className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No videos yet</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Upload videos to get started</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className={`group flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedVideo === video.id
                    ? 'bg-primary/8 ring-1 ring-primary/15'
                    : 'hover:bg-muted/50 active:scale-[0.98]'
                }`}
                onClick={() => onSelectVideo(video.id)}
              >
                <div className={`h-9 w-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  selectedVideo === video.id ? 'bg-primary/10' : 'bg-muted/50'
                }`}>
                  <Video className={`h-3.5 w-3.5 ${
                    selectedVideo === video.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden max-w-32">
                  <p className="text-sm font-medium truncate leading-tight" title={video.name}>{video.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{video.size}</p>
                </div>
                {video.id in results && (
                  <Badge variant="secondary" className="text-[10px] shrink-0 h-5 px-1.5 rounded-md font-medium bg-emerald-500/10 text-emerald-600 border-0">
                    Done
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md opacity-0 group-hover:opacity-100 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-all"
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
