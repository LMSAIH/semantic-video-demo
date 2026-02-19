import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Video, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import type { VideoFile } from '../types';

interface VideoSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: VideoFile[];
  onConfirm: (selectedVideoIds: string[]) => void;
  results: Record<string, unknown>;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function VideoSelectionModal({
  open,
  onOpenChange,
  videos,
  onConfirm,
  results,
  title = 'Select Videos to Analyze',
  description = 'Choose which videos you want to run analysis on',
  confirmLabel = 'Run Analysis',
}: VideoSelectionModalProps) {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());

  // Initialize with all videos selected when modal opens
  useEffect(() => {
    if (open) {
      setSelectedVideos(new Set(videos.map(v => v.id)));
    }
  }, [open, videos]);

  const handleToggle = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedVideos(new Set(videos.map(v => v.id)));
  };

  const handleDeselectAll = () => {
    setSelectedVideos(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedVideos));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col overflow-hidden sm:rounded-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedVideos.size} of {videos.length} video{videos.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm h-8 rounded-lg">
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeselectAll} className="text-sm h-8 rounded-lg">
              Deselect All
            </Button>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 -mx-6 px-6 overflow-y-scroll">
          <div className="space-y-1.5 pb-1">
            {videos.map((video) => {
              const isSelected = selectedVideos.has(video.id);
              const hasResult = video.id in results;

              return (
                <div
                  key={video.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/40 active:scale-[0.99]'
                  }`}
                  onClick={() => handleToggle(video.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(video.id)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="rounded-md"
                  />
                  
                  <div className={`h-10 w-14 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary/8' : 'bg-muted/40'
                  }`}>
                    <Video className={`h-4 w-4 ${isSelected ? 'text-primary/60' : 'text-muted-foreground/40'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={video.name}>
                      {video.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{video.size}</p>
                      {video.duration && (
                        <p className="text-xs text-muted-foreground">
                          • {video.duration.toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </div>

                  {hasResult && (
                    <Badge variant="secondary" className="shrink-0 gap-1 rounded-lg text-[11px] bg-emerald-500/10 text-emerald-600 border-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Analyzed
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 pt-4 border-t apple-divider">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl h-9 text-sm">
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedVideos.size === 0} className="rounded-xl h-9 text-sm apple-shadow">
            {confirmLabel} ({selectedVideos.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
