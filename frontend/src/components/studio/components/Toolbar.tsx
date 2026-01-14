import { Play, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ToolbarProps {
  videoCount: number;
  estimatedTokens: number | null;
  isAnalyzing: boolean;
  onEstimate: () => void;
  onAnalyze: () => void;
}

export function Toolbar({
  videoCount,
  estimatedTokens,
  isAnalyzing,
  onEstimate,
  onAnalyze,
}: ToolbarProps) {
  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-card shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">Semantic Video Studio</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
      </div>
      
      <div className="flex items-center gap-2">
        {estimatedTokens !== null && (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            ~{estimatedTokens.toLocaleString()} tokens
          </Badge>
        )}
        <Button variant="outline" size="sm" onClick={onEstimate} disabled={videoCount === 0}>
          Estimate Cost
        </Button>
        <Button size="sm" onClick={onAnalyze} disabled={videoCount === 0 || isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
