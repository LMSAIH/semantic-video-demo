import { useEffect, useState } from 'react';
import { Wand2, Loader2, FileText, Trash2, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComposerStore } from '../store/composerStore';
import type { AnalysisResult } from '../types';

interface ComposerPanelProps {
  videoId: string | null;
  result: AnalysisResult | null;
}

export function ComposerPanel({ videoId, result }: ComposerPanelProps) {
  const presets = useComposerStore(s => s.presets);
  const compositions = useComposerStore(s => s.compositions);
  const isGenerating = useComposerStore(s => s.isGenerating);
  const generateError = useComposerStore(s => s.generateError);
  const fetchPresets = useComposerStore(s => s.fetchPresets);
  const fetchCompositions = useComposerStore(s => s.fetchCompositions);
  const generate = useComposerStore(s => s.generate);
  const remove = useComposerStore(s => s.remove);
  const setViewingComposition = useComposerStore(s => s.setViewingComposition);

  const [selectedPreset, setSelectedPreset] = useState('');

  // Fetch presets on mount
  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  // Fetch compositions when video changes
  useEffect(() => {
    if (videoId) fetchCompositions(videoId);
  }, [videoId, fetchCompositions]);

  // Default selections
  useEffect(() => {
    if (presets.length > 0 && !selectedPreset) setSelectedPreset(presets[0].id);
  }, [presets, selectedPreset]);

  const videoCompositions = videoId ? (compositions[videoId] ?? []) : [];

  const getPresetLabel = (presetId: string) => {
    return presets.find(p => p.id === presetId)?.name ?? presetId;
  };

  const handleGenerate = () => {
    if (!videoId || !selectedPreset) return;
    generate(videoId, selectedPreset);
  };

  if (!videoId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
          <Wand2 className="h-5 w-5 opacity-40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Select a video to compose</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-5 w-5 opacity-40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Run analysis first</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Frame descriptions are needed to generate compositions
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-6">
        {/* Generate section */}
        <div className="space-y-4">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Generate Composition
          </Label>

          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Preset</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="rounded-xl h-10 text-sm">
                <SelectValue placeholder="Choose a preset..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {presets.map(p => (
                  <SelectItem key={p.id} value={p.id} className="rounded-lg text-sm">
                    <div>
                      <span>{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreset && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {presets.find(p => p.id === selectedPreset)?.description}
              </p>
            )}
          </div>

          {generateError && (
            <div className="rounded-xl bg-destructive/8 border border-destructive/15 p-2.5">
              <p className="text-xs text-destructive">{generateError}</p>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedPreset}
            className="w-full rounded-xl h-10 text-sm font-medium apple-shadow"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        <div className="h-px bg-border/40" />

        {/* Saved compositions */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saved Compositions
            </Label>
            {videoCompositions.length > 0 && (
              <Badge variant="secondary" className="text-xs rounded-md px-1.5 font-medium">
                {videoCompositions.length}
              </Badge>
            )}
          </div>

          {videoCompositions.length === 0 ? (
            <div className="text-center py-6 rounded-xl bg-muted/20">
              <FileText className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">No compositions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {videoCompositions.map(comp => (
                <div
                  key={comp.id}
                  className="rounded-xl border border-border/50 bg-background/50 p-3 transition-all duration-200 hover:bg-muted/40 hover:apple-shadow group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="secondary" className="text-xs rounded-md font-medium">
                      {getPresetLabel(comp.preset)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                    {comp.content}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 rounded-lg text-xs"
                      onClick={() => setViewingComposition(comp)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 rounded-lg text-xs hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(comp.id, comp.videoId)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                    <Badge variant="outline" className="text-[10px] rounded-md ml-auto">
                      {comp.model}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
