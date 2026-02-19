
interface StatusBarProps {
  videoCount: number;
  isAnalyzing: boolean;
}

export function StatusBar({ videoCount, isAnalyzing }: StatusBarProps) {
  return (
    <footer className="h-7 border-t apple-divider glass-subtle flex items-center justify-between px-4 text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          {videoCount} video{videoCount !== 1 ? 's' : ''}
        </span>
        {isAnalyzing && (
          <span className="text-primary flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Analysis in progress
          </span>
        )}
      </div>
    </footer>
  );
}
