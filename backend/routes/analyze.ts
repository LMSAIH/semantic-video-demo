import { Router } from "express";
import { analyzeVideos } from "../controllers/analyzeController";
import { estimateVideos } from "../controllers/estimateController";

const router = Router();

// Analyze videos with custom configurations
router.post("/", analyzeVideos);

// Estimate token usage for video analysis
router.post("/estimate", estimateVideos);

export default router;
