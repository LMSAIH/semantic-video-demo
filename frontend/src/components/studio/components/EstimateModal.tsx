import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Film, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Token Usage Estimate</DialogTitle>
          <DialogDescription>
            Estimated tokens and cost for your video analysis
          </DialogDescription>
        </DialogHeader>

        {isEstimating ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="font-medium text-lg">Calculating estimate...</h3>
              <p className="text-sm text-muted-foreground mt-1">Analyzing videos and computing token usage</p>
            </div>
          </div>
        ) : estimateData && (
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">{/* Summary Cards */}

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
              <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                ⚠️ Disclaimer: These estimates are approximate and may not reflect actual usage. Do not rely on these figures for critical budgeting decisions.
              </p>
            </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Film className="h-4 w-4" />
                Videos
              </div>
              <div className="text-2xl font-bold">{estimateData.videosEstimated}</div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                Total Tokens
              </div>
              <div className="text-2xl font-bold">
                {estimateData.grandTotal.totalTokens.toLocaleString()}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Est. Cost
              </div>
              <div className="text-2xl font-bold">
                ${estimateData.grandTotal.estimatedCost.toFixed(4)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Expandable Per-Video Breakdown */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => setShowPerVideo(!showPerVideo)}
            >
              <h3 className="font-semibold text-sm">Per-Video Breakdown ({estimateData.videos.length})</h3>
              {showPerVideo ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {showPerVideo && (
              <div className="space-y-2 mt-3">
                {estimateData.videos.map((video, index) => {
                  const videoName = video.videoPath.split('/').pop() || video.videoPath;
                  
                  return (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate" title={videoName}>
                            {videoName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
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
                      
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.numPartitions} partitions
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Per frame: {video.perFrame.totalTokens.toLocaleString()} tokens
                        </Badge>
                        <Badge variant="outline" className="text-xs">
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
          <div className="text-xs text-muted-foreground pt-2 space-y-2">
          
            <p>Estimation completed in {estimateData.elapsedTime}ms</p>
            <p>* Cost estimates are based on the selected model's pricing</p>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
