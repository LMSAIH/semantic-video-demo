import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
      <div className="text-center py-8 text-muted-foreground">
        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select a video to configure</p>
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
      <div className="p-4 space-y-6">
        {/* Model Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            AI Model
          </Label>
          <Select
            value={config.model}
            onValueChange={(value) => onUpdateConfig(videoId, { model: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {model.provider}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Partition Settings */}
        <div className="space-y-4">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Frame Partitioning
          </Label>
          
          <div className="space-y-2">
            <Label className="text-sm">Partition By</Label>
            <Select
              value={config.partitionType}
              onValueChange={(value: 'time' | 'frames') => 
                handlePartitionChange({ partitionType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time (seconds)</SelectItem>
                <SelectItem value="frames">Frame Count</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="text-sm">
                {config.partitionType === 'time' ? 'Interval (seconds)' : 'Interval (frames)'}
              </Label>
              <Input
                type="number"
                value={config.partitionInterval}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handlePartitionChange({ partitionInterval: Math.max(1, Math.min(1000, value)) });
                }}
                min={1}
                max={1000}
                className="w-20 h-8 text-sm"
              />
            </div>
            <Slider
              value={[config.partitionInterval]}
              onValueChange={([value]) => 
                handlePartitionChange({ partitionInterval: value })
              }
              min={1}
              max={1000}
              step={1}
            />
            <p className="text-xs text-muted-foreground">
              {config.partitionType === 'time' 
                ? `Extract frames every ${config.partitionInterval} second${config.partitionInterval !== 1 ? 's' : ''}`
                : `Extract frames every ${config.partitionInterval} frame${config.partitionInterval !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {config.partitionType === "frames" && <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <Label className="text-sm">Frame Rate (fps)</Label>
              <Input
                type="number"
                value={config.frameRate}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handlePartitionChange({ frameRate: Math.max(1, Math.min(240, value)) });
                }}
                min={1}
                max={240}
                className="w-20 h-8 text-sm"
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
            <p className="text-xs text-muted-foreground">
              Used for frame-based partition calculations
            </p>
          </div> }

          <div className="bg-muted/50 p-3 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Partitions:</span>
              <Badge variant="secondary" className="text-sm">
                {calculatedPartitions}
              </Badge>
            </div>
            {currentVideo?.duration ? (
              <p className="text-xs text-muted-foreground">
                Video duration: {currentVideo.duration.toFixed(1)}s
              </p>
            ) : (
              <p className="text-xs text-warning-foreground">
                ⚠️ Duration unavailable - using default calculation
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Custom Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Analysis Prompt
          </Label>
          <Textarea
            value={config.prompt}
            onChange={(e) => onUpdateConfig(videoId, { prompt: e.target.value })}
            placeholder="Describe what you want the AI to analyze..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            This prompt will be sent with each frame for analysis
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
