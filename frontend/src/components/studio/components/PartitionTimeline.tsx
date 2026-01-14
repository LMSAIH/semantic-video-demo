import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { AnalysisConfig, VideoFile } from '../types';

interface PartitionTimelineProps {
  video: VideoFile;
  config: AnalysisConfig;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  currentTime?: number;
}

export function PartitionTimeline({
  video,
  config,
  videoRef,
  currentTime = 0,
}: PartitionTimelineProps) {
  const [activePartitionIndex, setActivePartitionIndex] = useState<number | null>(null);
  const duration = video.duration || 0;
  const numPartitions = config.numPartitions || 10;

  if (!duration || duration <= 0) {
    return null;
  }

  // Calculate partition timestamps
  const partitionTimestamps: number[] = [];
  for (let i = 0; i <= numPartitions; i++) {
    const timestamp = (duration / numPartitions) * i;
    partitionTimestamps.push(timestamp);
  }

  const handleSeek = (timestamp: number, index: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setActivePartitionIndex(index);
    }
  };

  const formatTimeWithMilliseconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
  };

  return (
    <div className="border-t bg-card">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          PARTITION TIMELINE
        </span>
        <Badge variant="outline" className="text-xs">
          {numPartitions} partitions
        </Badge>
      </div>
      <div className="relative h-16 bg-muted/30">
        {/* Timeline bar */}
        <div className="absolute inset-0 flex items-center px-4">
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            {/* Current time indicator */}
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Partition markers */}
        <div className="absolute inset-0 flex items-center px-4">
          <div className="relative w-full">
            {partitionTimestamps.map((timestamp, index) => {
              const position = (timestamp / duration) * 100;
              const isActive = activePartitionIndex === index || 
                             (activePartitionIndex === null && 
                              currentTime >= timestamp && 
                              (index === partitionTimestamps.length - 1 || currentTime < partitionTimestamps[index + 1]));

              return (
                <div
                  key={index}
                  className="absolute group cursor-pointer"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  onClick={() => handleSeek(timestamp, index)}
                >
                  {/* Vertical line */}
                  <div
                    className={`w-0.5 h-8 -translate-y-1/2 transition-colors ${
                      isActive
                        ? 'bg-primary h-10'
                        : 'bg-border group-hover:bg-primary/70 group-hover:h-10'
                    }`}
                  />
                  
                  {/* Time label on hover - with milliseconds */}
                  <div
                    className="absolute top-full mt-1 whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded shadow-md z-10"
                    style={{ transform: 'translateX(-50%)', left: '50%' }}
                  >
                    {formatTimeWithMilliseconds(timestamp)}
                  </div>

                  {/* Partition number badge */}
                  {index < numPartitions && (
                    <div
                      className={`absolute bottom-full mb-1 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ transform: 'translateX(-50%)', left: '50%' }}
                    >
                      <Badge
                        variant={isActive ? 'default' : 'secondary'}
                        className="text-xs h-5"
                      >
                        P{index + 1}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
