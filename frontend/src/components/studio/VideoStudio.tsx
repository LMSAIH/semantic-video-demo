import { useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  useVideoLibraryStore,
  selectCurrentVideo,
  selectCurrentConfig,
  selectCurrentResult,
} from './store/videoLibraryStore';
import { useModelStore } from './store/modelStore';
import { useUploadStore } from './store/uploadStore';
import { useAnalysisStore } from './store/analysisStore';
import {
  Toolbar,
  VideoLibrary,
  VideoPreview,
  ConfigSidebar,
  StatusBar,
  CompositionModal,
} from './components';
import { EstimateModal } from './components/EstimateModal';
import { VideoSelectionModal } from './components/VideoSelectionModal';

export function VideoStudio() {
  // Video library
  const videos = useVideoLibraryStore(s => s.videos);
  const selectedVideo = useVideoLibraryStore(s => s.selectedVideo);
  const results = useVideoLibraryStore(s => s.results);
  const setSelectedVideo = useVideoLibraryStore(s => s.setSelectedVideo);
  const removeVideo = useVideoLibraryStore(s => s.removeVideo);
  const updateConfig = useVideoLibraryStore(s => s.updateConfig);
  const loadVideos = useVideoLibraryStore(s => s.loadVideos);
  const currentVideo = useVideoLibraryStore(selectCurrentVideo);
  const currentConfig = useVideoLibraryStore(selectCurrentConfig);
  const currentResult = useVideoLibraryStore(selectCurrentResult);

  // Models
  const models = useModelStore(s => s.models);
  const fetchModels = useModelStore(s => s.fetchModels);

  // Upload
  const isDragging = useUploadStore(s => s.isDragging);
  const uploadError = useUploadStore(s => s.uploadError);
  const isUploading = useUploadStore(s => s.isUploading);
  const setIsDragging = useUploadStore(s => s.setIsDragging);
  const handleFileDrop = useUploadStore(s => s.handleFileDrop);
  const handleFileSelect = useUploadStore(s => s.handleFileSelect);
  const clearUploadError = useUploadStore(s => s.clearUploadError);

  // Analysis
  const isAnalyzing = useAnalysisStore(s => s.isAnalyzing);
  const analysisProgress = useAnalysisStore(s => s.analysisProgress);
  const estimateData = useAnalysisStore(s => s.estimateData);
  const isEstimateModalOpen = useAnalysisStore(s => s.isEstimateModalOpen);
  const isEstimating = useAnalysisStore(s => s.isEstimating);
  const isVideoSelectionModalOpen = useAnalysisStore(s => s.isVideoSelectionModalOpen);
  const isEstimateSelectionModalOpen = useAnalysisStore(s => s.isEstimateSelectionModalOpen);
  const setIsEstimateModalOpen = useAnalysisStore(s => s.setIsEstimateModalOpen);
  const setIsVideoSelectionModalOpen = useAnalysisStore(s => s.setIsVideoSelectionModalOpen);
  const setIsEstimateSelectionModalOpen = useAnalysisStore(s => s.setIsEstimateSelectionModalOpen);
  const estimateTokens = useAnalysisStore(s => s.estimateTokens);
  const showVideoSelectionModal = useAnalysisStore(s => s.showVideoSelectionModal);
  const showEstimateSelectionModal = useAnalysisStore(s => s.showEstimateSelectionModal);
  const runAnalysis = useAnalysisStore(s => s.runAnalysis);

  // Load data on mount
  useEffect(() => { fetchModels(); loadVideos(); }, [fetchModels, loadVideos]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex bg-background overflow-hidden">
        {/* Left sidebar — full height */}
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

        {/* Center + Right area with toolbar on top */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar
            videoCount={videos.length}
            isAnalyzing={isAnalyzing}
            onEstimate={showEstimateSelectionModal}
            onAnalyze={showVideoSelectionModal}
          />

          <div className="flex-1 flex overflow-hidden">
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
      </div>
      <EstimateModal 
        open={isEstimateModalOpen}
        onOpenChange={setIsEstimateModalOpen}
        estimateData={estimateData}
        isEstimating={isEstimating}
      />

      <CompositionModal />

      <VideoSelectionModal
        open={isVideoSelectionModalOpen}
        onOpenChange={setIsVideoSelectionModalOpen}
        videos={videos}
        results={results}
        onConfirm={runAnalysis}
      />

      <VideoSelectionModal
        open={isEstimateSelectionModalOpen}
        onOpenChange={setIsEstimateSelectionModalOpen}
        videos={videos}
        results={results}
        onConfirm={estimateTokens}
        title="Select Videos to Estimate"
        description="Choose which videos to include in the cost estimate"
        confirmLabel="Estimate Cost"
      />
    </TooltipProvider>
  );
}
