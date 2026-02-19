import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { composeFromFrames, PRESETS } from '../services/composerService';
import {
  getCompositionsByVideo,
  getCompositionById,
  createComposition,
  deleteComposition,
} from '../db/compositionsRepo';
import { getResultForVideo } from '../db/videosRepo';
import { getVideoById } from '../db/videosRepo';

/* GET /composer/presets — list available presets */
export const listPresets = (_req: Request, res: Response) => {
  res.json({
    presets: PRESETS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
    })),
  });
};

/* GET /composer/:videoId — list compositions for a video */
export const listCompositions = (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const rows = getCompositionsByVideo(videoId);
    res.json({
      compositions: rows.map(r => ({
        id: r.id,
        videoId: r.video_id,
        preset: r.preset,
        model: r.model,
        content: r.content,
        createdAt: r.created_at,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* POST /composer/generate — generate a new composition */
export const generateComposition = async (req: Request, res: Response) => {
  try {
    const { videoId, preset } = req.body;

    if (!videoId || !preset) {
      return res.status(400).json({ error: 'videoId and preset are required' });
    }

    // Fetch analysis results for this video
    const result = getResultForVideo(videoId);
    if (!result) {
      return res.status(404).json({ error: 'No analysis results found for this video. Run analysis first.' });
    }

    const video = getVideoById(videoId);
    const videoName = video?.name ?? 'Unknown video';

    const frames = JSON.parse(result.frames_json) as Array<{
      frameNumber: number;
      timestamp: number;
      description: string;
    }>;

    // Call the AI composition service
    const model = 'gpt-5-nano';
    const content = await composeFromFrames(preset, frames, videoName);

    // Store in DB
    const id = randomUUID();
    const row = createComposition({ id, videoId, preset, model, content });

    res.json({
      composition: {
        id: row.id,
        videoId: row.video_id,
        preset: row.preset,
        model: row.model,
        content: row.content,
        createdAt: row.created_at,
      },
    });
  } catch (err: any) {
    console.error('Error generating composition:', err);
    res.status(500).json({ error: err.message });
  }
};

/* GET /composer/composition/:id — get a single composition */
export const getComposition = (req: Request, res: Response) => {
  try {
    const row = getCompositionById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Composition not found' });
    res.json({
      id: row.id,
      videoId: row.video_id,
      preset: row.preset,
      model: row.model,
      content: row.content,
      createdAt: row.created_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/* DELETE /composer/composition/:id */
export const removeComposition = (req: Request, res: Response) => {
  try {
    const deleted = deleteComposition(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Composition not found' });
    res.json({ deleted: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
