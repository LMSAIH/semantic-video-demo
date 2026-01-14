import { Settings, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigPanel } from './ConfigPanel';
import { OutputPanel } from './OutputPanel';
import type { AnalysisConfig, AnalysisResult, Model, VideoFile } from '../types';

interface ConfigSidebarProps {
  config: AnalysisConfig | null;
  result: AnalysisResult | null;
  models: Model[];
  videoId: string | null;
  currentVideo?: VideoFile;
  onUpdateConfig: (videoId: string, updates: Partial<AnalysisConfig>) => void;
}

export function ConfigSidebar({
  config,
  result,
  models,
  videoId,
  currentVideo,
  onUpdateConfig,
}: ConfigSidebarProps) {
  return (
    <div className="w-80 shrink-0 h-full border-l bg-card/50">
      <Tabs defaultValue="config" className="h-full flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 shrink-0">
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Settings className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Output
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="flex-1 m-0 overflow-hidden">
          <ConfigPanel
            config={config}
            models={models}
            videoId={videoId}
            currentVideo={currentVideo}
            onUpdateConfig={onUpdateConfig}
          />
        </TabsContent>

        <TabsContent value="output" className="flex-1 m-0 overflow-hidden">
          <OutputPanel result={result} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
