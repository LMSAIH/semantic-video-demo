import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Film, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { EstimateResponse } from '../services/videoApi';

interface EstimateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateData: EstimateResponse | null;
  isEstimating?: boolean;
}



export function EstimateModal({ open, onOpenChange, estimateData, isEstimating = false }: EstimateModalProps) {
  const [showPerVideo, setShowPerVideo] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col sm:rounded-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg font-semibold tracking-tight">Token Usage Estimate</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Estimated tokens and cost for your video analysis
          </DialogDescription>
        </DialogHeader>

        {isEstimating ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-base tracking-tight">Calculating estimate...</h3>
              <p className="text-sm text-muted-foreground mt-1">Analyzing videos and computing token usage</p>
            </div>
          </div>
        ) : estimateData && (
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3.5">
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                ⚠️ These estimates are approximate and may not reflect actual usage.
              </p>
            </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                <Film className="h-3.5 w-3.5" />
                Videos
              </div>
              <div className="text-2xl font-bold tracking-tight">{estimateData.videosEstimated}</div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="h-3.5 w-3.5" />
                Total Tokens
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {estimateData.grandTotal.totalTokens.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
                <DollarSign className="h-3.5 w-3.5" />
                Est. Cost
              </div>
              <div className="text-2xl font-bold tracking-tight">
                ${estimateData.grandTotal.estimatedCost.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          {/* Expandable Per-Video Breakdown */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => setShowPerVideo(!showPerVideo)}
            >
              <h3 className="font-semibold text-sm tracking-tight">Per-Video Breakdown ({estimateData.videos.length})</h3>
              {showPerVideo ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              )}
            </Button>
            
            {showPerVideo && (
              <div className="space-y-2 mt-3">
                {estimateData.videos.map((video, index) => {
                  const videoName = video.videoPath.split('/').pop() || video.videoPath;
                  
                  return (
                    <div key={index} className="p-3.5 rounded-xl bg-muted/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate" title={videoName}>
                            {videoName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Model: {video.model}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="font-semibold text-sm">
                            {video.total.totalTokens.toLocaleString()} tokens
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${video.total.estimatedCost.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <Badge variant="secondary" className="text-[10px] rounded-md">
                          {video.numPartitions} partitions
                        </Badge>
                        <Badge variant="outline" className="text-[10px] rounded-md">
                          Per frame: {video.perFrame.totalTokens.toLocaleString()} tokens
                        </Badge>
                        <Badge variant="outline" className="text-[10px] rounded-md">
                          Input: {video.perFrame.totalTokens.toLocaleString()} tokens
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-xs text-muted-foreground pt-2 space-y-1">
          
            <p>Estimation completed in {estimateData.elapsedTime}ms</p>
            <p>* Cost estimates are based on the selected model's pricing</p>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
