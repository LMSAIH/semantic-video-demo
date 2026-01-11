/**
 * Example configuration for video analysis
 */
export const EXAMPLE_ANALYZE_CONFIG = {
  configs: [
    {
      videoPath: "filename.mp4",
      numPartitions: 10,
      prompt: "Describe what you see",
      quality: 10,
      scale: 720,
      model: "gpt-5-nano"
    }
  ]
};

/**
 * Default values for video analysis configuration
 */
export const DEFAULT_CONFIG = {
  numPartitions: 10,
  prompt: "Describe the main events and objects in the video.",
  quality: 10,
  scale: 720,
  model: "gpt-5-nano"
};
