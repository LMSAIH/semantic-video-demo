import { TooltipProvider } from '@/components/ui/tooltip';
import { useVideoStudio } from './hooks/useVideoStudio';
import {
  Toolbar,
  VideoLibrary,
  VideoPreview,
  ConfigSidebar,
  StatusBar,
} from './components';
import { EstimateModal } from './components/EstimateModal';

export function VideoStudio() {
  const {
    videos,
    selectedVideo,
    models,
    results,
    isAnalyzing,
    analysisProgress,
    estimateData,
    isEstimateModalOpen,
    isDragging,
    currentVideo,
    currentConfig,
    currentResult,
    uploadError,
    isUploading,
    setSelectedVideo,
    setIsDragging,
    setIsEstimateModalOpen,
    handleFileDrop,
    handleFileSelect,
    removeVideo,
    updateConfig,
    estimateTokens,
    runAnalysis,
    clearUploadError,
  } = useVideoStudio();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background">
        <Toolbar
          videoCount={videos.length}
          isAnalyzing={isAnalyzing}
          onEstimate={estimateTokens}
          onAnalyze={runAnalysis}
        />

        <div className="flex-1 flex overflow-hidden">
          <VideoLibrary
            videos={videos}
            selectedVideo={selectedVideo}
            results={results}
            isDragging={isDragging}
            onSelectVideo={setSelectedVideo}
            onRemoveVideo={removeVideo}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onFileSelect={handleFileSelect}
            uploadError={uploadError}
            isUploading={isUploading}
            onClearError={clearUploadError}
          />

          <VideoPreview
            currentVideo={currentVideo}
            currentConfig={currentConfig}
            currentResult={currentResult}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            onFileSelect={handleFileSelect}
            uploadError={uploadError}
            isUploading={isUploading}
            onClearError={clearUploadError}
          />

          <ConfigSidebar
            config={currentConfig}
            result={currentResult}
            models={models}
            videoId={selectedVideo}
            currentVideo={currentVideo}
            onUpdateConfig={updateConfig}
          />
        </div>

        <StatusBar videoCount={videos.length} isAnalyzing={isAnalyzing} />
      </div>

      <EstimateModal 
        open={isEstimateModalOpen}
        onOpenChange={setIsEstimateModalOpen}
        estimateData={estimateData}
      />
    </TooltipProvider>
  );
}
