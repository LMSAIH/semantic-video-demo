import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  videoCount: number;
  isAnalyzing: boolean;
  onEstimate: () => void;
  onAnalyze: () => void;
}

export function Toolbar({
  videoCount,
  isAnalyzing,
  onEstimate,
  onAnalyze,
}: ToolbarProps) {
  return (
    <header className="h-12 glass border-b apple-divider flex items-center justify-end px-5 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onEstimate} 
          disabled={videoCount === 0 || isAnalyzing}
          className="h-8 px-3.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          Estimate Cost
        </Button>
        <Button 
          size="sm" 
          onClick={onAnalyze} 
          disabled={videoCount === 0 || isAnalyzing}
          className="h-8 px-4 text-sm font-medium rounded-lg apple-shadow"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Run Analysis
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
