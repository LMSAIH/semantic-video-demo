import { Router, Request, Response } from "express";
import { getSupportedModels } from "semantic-video";

const router = Router();

/**
 * GET /models — read-only list sourced from the semantic-video package.
 * Models are fixed; they cannot be created, updated, or deleted.
 */
router.get("/", (_req: Request, res: Response) => {
  const modelIds = getSupportedModels();
  const models = modelIds.map((id: string) => ({ id, name: id, provider: "OpenAI" }));
  res.json({ models: modelIds, details: models, count: models.length });
});

export default router;
