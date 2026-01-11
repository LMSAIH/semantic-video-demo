import { SemanticVideoClient, FrameData } from "semantic-video";

const MAX_FRAME_CONCURRENCY = parseInt(
  process.env.MAX_FRAME_CONCURRENCY || "5"
);
const MAX_VIDEO_CONCURRENCY = parseInt(
  process.env.MAX_VIDEO_CONCURRENCY || "5"
);

const semanticVideoClient = new SemanticVideoClient(
  process.env.OPENAI_API_KEY || "",
  { enabled: true, level: "verbose", showEstimateTables: true },
  MAX_VIDEO_CONCURRENCY,
  MAX_FRAME_CONCURRENCY
);

/**
 * Analyzes multiple videos with the provided configurations
 */
export async function analyzeMultipleVideos(configs: any[]) {
  return await semanticVideoClient.analyzeMultipleVideos(configs);
}

/**
 * Sanitizes video analysis results to only include safe data
 */
export function sanitizeResults(results: any[], configs: any[]) {
  return results.map((videoResult, index) => {
    const frames = videoResult.frames.map((frame: FrameData) => ({
      frameNumber: frame.frameNumber,
      timestamp: frame.timestamp,
      description: frame.description,
    }));

    return {
      videoPath: configs[index].videoPath,
      config: configs[index],
      totalFrames: frames.length,
      frames,
    };
  });
}
