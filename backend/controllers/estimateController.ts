import { Request, Response } from "express";
import { getSupportedModels } from "semantic-video";
import { EXAMPLE_ANALYZE_CONFIG } from "../utils/examples";
import { validateConfigs } from "../validators/configValidator";
import { estimateTokenUsage } from "../services/estimationService";

export const estimateVideos = async (req: Request, res: Response) => {
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

    // Estimate token usage
    const estimations = await estimateTokenUsage(validatedConfigs);

    res.json({
      message: "Token estimation completed",
      videosEstimated: estimations.videos.length,
      videos: estimations.videos,
      grandTotal: estimations.grandTotal,
      elapsedTime: estimations.elapsedTime,
    });
  } catch (error: any) {
    console.log("Error estimating token usage:", error);
    res.status(500).json({
      error: "Error estimating token usage",
      details: error.message,
    });
  }
};
