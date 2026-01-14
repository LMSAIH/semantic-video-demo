
interface StatusBarProps {
  videoCount: number;
  isAnalyzing: boolean;
}

export function StatusBar({ videoCount, isAnalyzing }: StatusBarProps) {
  return (
    <footer className="h-6 border-t bg-card flex items-center justify-between px-3 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-4">
        <span>
          {videoCount} video{videoCount !== 1 ? 's' : ''}
        </span>
        {isAnalyzing && <span className="text-primary">Analysis in progress...</span>}
      </div>
    </footer>
  );
}
