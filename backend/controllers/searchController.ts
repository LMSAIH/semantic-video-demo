import { Request, Response } from 'express';
import * as embeddingService from '../services/embeddingService';

/**
 * POST /search — semantic search across all video frame descriptions
 * Body: { query: string, threshold?: number, limit?: number }
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { query, threshold = 0.3, limit = 20 } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'query is required' });
    }

    const results = await embeddingService.searchEmbeddings(
      query.trim(),
      Number(threshold),
      Number(limit),
    );

    res.json({ results, count: results.length });
  } catch (error: any) {
    console.error('Search failed:', error);
    res.status(500).json({ error: 'Search failed', details: error.message });
  }
};

/**
 * POST /search/generate — generate embeddings for a video's analysis results
 * Body: { videoId: string, frames: Array<{ frameNumber, timestamp, description }> }
 */
export const generateEmbeddings = async (req: Request, res: Response) => {
  try {
    const { videoId, frames } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: 'frames array is required and must not be empty' });
    }

    const count = await embeddingService.generateEmbeddingsForVideo(videoId, frames);
    res.json({ message: 'Embeddings generated', videoId, count });
  } catch (error: any) {
    console.error('Embedding generation failed:', error);
    res.status(500).json({ error: 'Embedding generation failed', details: error.message });
  }
};

/**
 * DELETE /search/embeddings/:videoId — delete embeddings for a video
 */
export const deleteEmbeddings = (req: Request, res: Response) => {
  try {
    embeddingService.deleteEmbeddingsForVideo(req.params.videoId);
    res.json({ message: 'Embeddings deleted', videoId: req.params.videoId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete embeddings', details: error.message });
  }
};

/**
 * GET /search/status/:videoId — check if a video has embeddings
 */
export const embeddingStatus = (req: Request, res: Response) => {
  try {
    const hasEmbeddings = embeddingService.videoHasEmbeddings(req.params.videoId);
    res.json({ videoId: req.params.videoId, hasEmbeddings });
  } catch (error: any) {
    res.status(500).json({ error: 'Status check failed', details: error.message });
  }
};
