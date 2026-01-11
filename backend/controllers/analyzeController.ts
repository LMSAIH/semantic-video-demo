import { Request, Response } from "express";
import { getSupportedModels } from "semantic-video";
import { EXAMPLE_ANALYZE_CONFIG } from "../utils/examples";
import { validateConfigs } from "../validators/configValidator";
import { analyzeMultipleVideos, sanitizeResults } from "../services/videoAnalysisService";

export const analyzeVideos = async (req: Request, res: Response) => {
  try {
    // Validate request body
    if (!req.body || !req.body.configs || !Array.isArray(req.body.configs)) {
      return res.status(400).json({
        error: "configs array is required",
        example: EXAMPLE_ANALYZE_CONFIG
      });
    }

    // Validate configurations
    const { isValid, errors, validatedConfigs } = await validateConfigs(req.body.configs);

    if (!isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
        supportedModels: getSupportedModels()
      });
    }

    // Analyze videos
    const results = await analyzeMultipleVideos(validatedConfigs);

    // Sanitize and send results
    const sanitizedResults = sanitizeResults(results, validatedConfigs);

    res.json({
      message: "Analysis completed",
      videosAnalyzed: sanitizedResults.length,
      results: sanitizedResults,
    });
  } catch (error: any) {
    console.log("Error analyzing video:", error);
    res.status(500).json({
      error: "Error analyzing video",
      details: error.message,
    });
  }
};
