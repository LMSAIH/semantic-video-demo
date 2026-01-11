import { Router, Request, Response } from "express";
import { getSupportedModels } from "semantic-video";

const router = Router();

// Get all supported AI models
router.get("/", (req: Request, res: Response) => {
  const supportedModels = getSupportedModels(); 

  res.json({
    models: supportedModels,
    count: supportedModels.length
  });
});

export default router;
