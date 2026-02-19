import { Sparkles, Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useVideoLibraryStore } from '../store/videoLibraryStore';
import type { AnalysisResult } from '../types';

interface OutputPanelProps {
  result: AnalysisResult | null;
}

export function OutputPanel({ result }: OutputPanelProps) {
  const seekTo = useVideoLibraryStore(s => s.seekTo);

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-5 w-5 opacity-40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No results yet</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Run analysis to see output</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-5">
        <div className="space-y-5">
          {/* Summary */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Analysis Summary
            </Label>
            <div className="bg-muted/30 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Frames</span>
                <Badge variant="secondary" className="rounded-lg text-sm font-semibold">{result.totalFrames}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Video Path</span>
                <span className="text-xs text-muted-foreground truncate max-w-40">
                  {result.videoPath}
                </span>
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Frame Descriptions */}
          <div className="space-y-2.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Frame Descriptions
            </Label>
            <div className="space-y-2">
              {result.frames.map((frame) => (
                <div
                  key={frame.frameNumber}
                  className="rounded-xl border border-border/50 bg-background/50 p-3.5 cursor-pointer transition-all duration-200 hover:bg-muted/40 hover:apple-shadow active:scale-[0.98] group"
                  onClick={() => seekTo(frame.timestamp)}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    <span className="text-sm font-semibold tracking-tight">Frame {frame.frameNumber}</span>
                    <Badge variant="outline" className="text-[10px] rounded-md ml-auto">
                      {frame.timestamp.toFixed(2)}s
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                    {frame.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
