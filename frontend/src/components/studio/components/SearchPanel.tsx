import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Loader2, Video, Clock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSearchStore } from '../store/searchStore';
import { useVideoLibraryStore } from '../store/videoLibraryStore';

export function SearchPanel() {
  const query = useSearchStore(s => s.query);
  const results = useSearchStore(s => s.results);
  const isSearching = useSearchStore(s => s.isSearching);
  const threshold = useSearchStore(s => s.threshold);
  const searchError = useSearchStore(s => s.searchError);
  const setQuery = useSearchStore(s => s.setQuery);
  const setThreshold = useSearchStore(s => s.setThreshold);
  const search = useSearchStore(s => s.search);
  const clearSearch = useSearchStore(s => s.clearSearch);

  const setSelectedVideo = useVideoLibraryStore(s => s.setSelectedVideo);
  const seekTo = useVideoLibraryStore(s => s.seekTo);

  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced auto-search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        search();
      }, 400);
    }
  }, [setQuery, search]);

  // Re-search when threshold changes (if there's a query)
  useEffect(() => {
    if (query.trim().length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(), 300);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [threshold]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResultClick = (videoId: string, timestamp: number) => {
    setSelectedVideo(videoId);
    // Small delay to allow video to load before seeking
    setTimeout(() => seekTo(timestamp), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      search();
    }
    if (e.key === 'Escape') {
      clearSearch();
      inputRef.current?.blur();
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.7) return 'text-emerald-500';
    if (similarity >= 0.5) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getSimilarityBg = (similarity: number) => {
    if (similarity >= 0.7) return 'bg-emerald-500/10 border-emerald-500/20';
    if (similarity >= 0.5) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-muted/50 border-border';
  };

  return (
    <div className="flex flex-col min-h-0 overflow-hidden">
      {/* Search input — Apple-style frosted glass look */}
      <div className="px-3 pb-2">
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search frames..."
            className="h-8  pr-16 text-sm rounded-lg bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background/80 backdrop-blur-sm transition-all placeholder:text-muted-foreground/60"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {isSearching && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-muted/60"
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 rounded-full hover:bg-muted/60 ${showSettings ? 'bg-primary/8 text-primary' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <SlidersHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Similarity threshold control */}
      {showSettings && (
        <div className="px-3 pb-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
          <div className="rounded-xl bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Similarity
              </Label>
              <span className="text-xs font-mono tabular-nums text-muted-foreground">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              value={[threshold]}
              onValueChange={([v]) => setThreshold(v)}
              min={0.1}
              max={0.9}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              Higher values return more precise matches
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {searchError && (
        <div className="px-3 pb-2">
          <div className="rounded-xl bg-destructive/8 border border-destructive/15 p-2.5">
            <p className="text-[10px] text-destructive">{searchError}</p>
          </div>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="border-t apple-divider flex flex-col min-h-0 overflow-hidden flex-1">
          <div className="px-3 py-1.5 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Results
            </span>
            <Badge variant="secondary" className="text-xs h-4 px-1.5 font-mono rounded-md">
              {results.length}
            </Badge>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-2 pb-2 space-y-1">
              {results.map((result, idx) => (
                <button
                  key={`${result.videoId}-${result.frameNumber}-${idx}`}
                  className={`w-full text-left rounded-xl p-2.5 border transition-all duration-200
                    hover:apple-shadow active:scale-[0.97] cursor-pointer group
                    ${getSimilarityBg(result.similarity)}
                  `}
                  onClick={() => handleResultClick(result.videoId, result.timestamp)}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Video className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate flex-1">
                      {result.videoName}
                    </span>
                    <span className={`text-xs font-mono tabular-nums ${getSimilarityColor(result.similarity)}`}>
                      {(result.similarity * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
                    {result.description}
                  </p>

                  {/* Footer badges */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-2.5 w-2.5" />
                      Frame {result.frameNumber}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {result.timestamp.toFixed(2)}s
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty state after search */}
      {query.trim().length >= 2 && !isSearching && results.length === 0 && !searchError && (
        <div className="px-3 pb-2">
          <div className="text-center py-4 rounded-xl bg-muted/15">
            <Search className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No matching frames found</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Try lowering the similarity threshold
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
