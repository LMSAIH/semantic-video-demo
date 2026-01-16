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
  results: Map<string, unknown>;
}

export function VideoSelectionModal({ open, onOpenChange, videos, onConfirm, results }: VideoSelectionModalProps) {
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Select Videos to Analyze</DialogTitle>
          <DialogDescription>
            Choose which videos you want to run analysis on
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2 shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedVideos.size} of {videos.length} video{videos.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {videos.map((video) => {
              const isSelected = selectedVideos.has(video.id);
              const hasResult = results.has(video.id);

              return (
                <div
                  key={video.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleToggle(video.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(video.id)}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  
                  <div className="h-12 w-16 bg-muted rounded flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={video.name}>
                      {video.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{video.size}</p>
                      {video.duration && (
                        <p className="text-xs text-muted-foreground">
                          • {video.duration.toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </div>

                  {hasResult && (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Analyzed
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedVideos.size === 0}>
            Run Analysis ({selectedVideos.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
