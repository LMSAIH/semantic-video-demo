import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { calculatePartitions } from '../utils/videoHelpers';
import type { AnalysisConfig, Model, VideoFile } from '../types';

interface ConfigPanelProps {
  config: AnalysisConfig | null;
  models: Model[];
  videoId: string | null;
  currentVideo?: VideoFile;
  onUpdateConfig: (videoId: string, updates: Partial<AnalysisConfig>) => void;
}

export function ConfigPanel({
  config,
  models,
  videoId,
  currentVideo,
  onUpdateConfig,
}: ConfigPanelProps) {
  if (!config || !videoId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-3">
          <Settings className="h-5 w-5 opacity-40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Select a video to configure</p>
      </div>
    );
  }



  // Calculate partitions based on current config and video duration
  const calculatedPartitions = calculatePartitions(
    config,
    currentVideo?.duration
  );

  // Update numPartitions when partition settings change
  const handlePartitionChange = (updates: Partial<AnalysisConfig>) => {
    const newConfig = { ...config, ...updates };
    const newPartitions = calculatePartitions(
      newConfig,
      currentVideo?.duration
    );
    onUpdateConfig(videoId, { ...updates, numPartitions: newPartitions });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-2">
        {/* Model Selection */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Model
          </Label>
          <Select
            value={config.model}
            onValueChange={(value) => onUpdateConfig(videoId, { model: value })}
          >
            <SelectTrigger className="rounded-xl h-10 text-sm">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id} className="rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="text-[10px] rounded-md">
                      {model.provider}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border/40" />

        {/* Partition Settings */}
        <div className="space-y-4">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Frame Partitioning
          </Label>
          
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Partition By</Label>
            <Select
              value={config.partitionType}
              onValueChange={(value: 'time' | 'frames') => 
                handlePartitionChange({ partitionType: value })
              }
            >
              <SelectTrigger className="rounded-xl h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="time" className="rounded-lg text-sm">Time (seconds)</SelectItem>
                <SelectItem value="frames" className="rounded-lg text-sm">Frame Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center gap-2">
              <Label className="text-sm font-medium">
                {config.partitionType === 'time' ? 'Interval (seconds)' : 'Interval (frames)'}
              </Label>
              <Input
                type="number"
                value={config.partitionInterval}
                onChange={(e) => {
                  const isTime = config.partitionType === 'time';
                  const value = isTime
                    ? parseFloat(e.target.value) || 0.1
                    : parseInt(e.target.value) || 1;
                  const min = isTime ? 0.1 : 1;
                  handlePartitionChange({ partitionInterval: Math.max(min, Math.min(1000, value)) });
                }}
                min={config.partitionType === 'time' ? 0.1 : 1}
                step={config.partitionType === 'time' ? 0.1 : 1}
                max={1000}
                className="w-20 h-8 text-sm rounded-lg"
              />
            </div>
            <Slider
              value={[config.partitionInterval]}
              onValueChange={([value]) => 
                handlePartitionChange({ partitionInterval: value })
              }
              min={config.partitionType === 'time' ? 0.1 : 1}
              max={1000}
              step={config.partitionType === 'time' ? 0.1 : 1}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {config.partitionType === 'time' 
                ? `Extract frames every ${config.partitionInterval} second${config.partitionInterval !== 1 ? 's' : ''}`
                : `Extract frames every ${config.partitionInterval} frame${config.partitionInterval !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {config.partitionType === "frames" && <div className="space-y-2.5">
            <div className="flex justify-between items-center gap-2">
              <Label className="text-sm font-medium">Frame Rate (fps)</Label>
              <Input
                type="number"
                value={config.frameRate}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handlePartitionChange({ frameRate: Math.max(1, Math.min(240, value)) });
                }}
                min={1}
                max={240}
                className="w-20 h-8 text-sm rounded-lg"
              />
            </div>
            <Slider
              value={[config.frameRate]}
              onValueChange={([value]) => 
                handlePartitionChange({ frameRate: value })
              }
              min={1}
              max={240}
              step={1}
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Used for frame-based partition calculations
            </p>
          </div> }

          <div className="bg-muted/30 p-3.5 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Partitions</span>
              <Badge variant="secondary" className="text-sm rounded-lg px-2.5 font-semibold">
                {calculatedPartitions}
              </Badge>
            </div>
            {currentVideo?.duration ? (
              <p className="text-xs text-muted-foreground">
                Video duration: {currentVideo.duration.toFixed(1)}s
              </p>
            ) : (
              <p className="text-xs text-amber-600">
                ⚠️ Duration unavailable — using default calculation
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-border/40" />

        {/* Custom Prompt */}
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analysis Prompt
          </Label>
          <Textarea
            value={config.prompt}
            onChange={(e) => onUpdateConfig(videoId, { prompt: e.target.value })}
            placeholder="Describe what you want the AI to analyze..."
            rows={4}
            className="resize-none rounded-xl text-sm leading-relaxed"
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This prompt will be sent with each frame for analysis
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
