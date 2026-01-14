import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResult } from '../types';

interface OutputPanelProps {
  result: AnalysisResult | null;
}

export function OutputPanel({ result }: OutputPanelProps) {
  if (!result) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No analysis results yet</p>
        <p className="text-xs mt-1">Run analysis to see output</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Analysis Summary
            </Label>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Frames</span>
                  <Badge>{result.totalFrames}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Video Path</span>
                  <span className="text-xs text-muted-foreground truncate max-w-40">
                    {result.videoPath}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Frame Descriptions
            </Label>
            <div className="space-y-2">
              {result.frames.map((frame) => (
                <Card key={frame.frameNumber}>
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-xs flex items-center gap-2">
                      Frame {frame.frameNumber}
                      <Badge variant="outline" className="text-xs">
                        {frame.timestamp.toFixed(2)}s
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {frame.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
