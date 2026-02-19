import { Settings, ChevronRight, Wand2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfigPanel } from './ConfigPanel';
import { OutputPanel } from './OutputPanel';
import { ComposerPanel } from './ComposerPanel';
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
    <div className="w-96 shrink-0 h-full border-l apple-divider glass-subtle">
      <Tabs defaultValue="config" className="h-full flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b apple-divider bg-transparent p-0 h-11 shrink-0">
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm font-medium px-4 h-full transition-colors"
          >
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Config
          </TabsTrigger>
          <TabsTrigger
            value="output"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm font-medium px-4 h-full transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
            Output
          </TabsTrigger>
          <TabsTrigger
            value="composer"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm font-medium px-4 h-full transition-colors"
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            Composer
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

        <TabsContent value="composer" className="flex-1 m-0 overflow-hidden">
          <ComposerPanel videoId={videoId} result={result} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
