import { Request, Response } from 'express';
import * as videosRepo from '../db/videosRepo';
import { deleteFile } from '../utils/fileUtils';

/**
 * GET /videos — list all videos with their configs & results
 */
export const listVideos = (req: Request, res: Response) => {
  try {
    const fullVideos = videosRepo.getAllFullVideos();

    const mapped = fullVideos.map(fv => ({
      id: fv.video.id,
      name: fv.video.name,
      size: fv.video.size,
      duration: fv.video.duration,
      uploadedPath: fv.video.uploaded_path,
      createdAt: fv.video.created_at,
      config: fv.config ? {
        videoId: fv.config.video_id,
        model: fv.config.model,
        partitionType: fv.config.partition_type,
        partitionInterval: fv.config.partition_interval,
        frameRate: fv.config.frame_rate,
        numPartitions: fv.config.num_partitions,
        prompt: fv.config.prompt,
        detail: fv.config.detail,
      } : null,
      result: fv.result ? {
        videoPath: fv.result.video_path,
        totalFrames: fv.result.total_frames,
        frames: JSON.parse(fv.result.frames_json),
      } : null,
    }));

    res.json({ videos: mapped });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list videos', details: error.message });
  }
};

/**
 * GET /videos/:id — get a single video with config & result
 */
export const getVideo = (req: Request, res: Response) => {
  try {
    const fv = videosRepo.getFullVideo(req.params.id);
    if (!fv) return res.status(404).json({ error: 'Video not found' });

    res.json({
      id: fv.video.id,
      name: fv.video.name,
      size: fv.video.size,
      duration: fv.video.duration,
      uploadedPath: fv.video.uploaded_path,
      createdAt: fv.video.created_at,
      config: fv.config ? {
        videoId: fv.config.video_id,
        model: fv.config.model,
        partitionType: fv.config.partition_type,
        partitionInterval: fv.config.partition_interval,
        frameRate: fv.config.frame_rate,
        numPartitions: fv.config.num_partitions,
        prompt: fv.config.prompt,
        detail: fv.config.detail,
      } : null,
      result: fv.result ? {
        videoPath: fv.result.video_path,
        totalFrames: fv.result.total_frames,
        frames: JSON.parse(fv.result.frames_json),
      } : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get video', details: error.message });
  }
};

/**
 * POST /videos — create a video record (called after file upload)
 */
export const createVideo = (req: Request, res: Response) => {
  try {
    const { id, name, size, duration, uploadedPath, config } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'id and name are required' });
    }

    const video = videosRepo.createVideo({ id, name, size: size || '0 B', duration, uploadedPath });

    // Also create the analysis config if provided
    if (config) {
      videosRepo.upsertConfig({
        videoId: id,
        model: config.model,
        partitionType: config.partitionType,
        partitionInterval: config.partitionInterval,
        frameRate: config.frameRate,
        numPartitions: config.numPartitions,
        prompt: config.prompt,
        detail: config.detail,
      });
    }

    res.status(201).json({
      id: video.id,
      name: video.name,
      size: video.size,
      duration: video.duration,
      uploadedPath: video.uploaded_path,
      createdAt: video.created_at,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create video', details: error.message });
  }
};

/**
 * PATCH /videos/:id — update video metadata (e.g. duration) or config
 */
export const updateVideo = (req: Request, res: Response) => {
  try {
    const { name, size, duration, uploadedPath, config, result } = req.body;

    const video = videosRepo.updateVideo(req.params.id, { name, size, duration, uploadedPath });
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (config) {
      // Merge incoming partial config with existing values so we don't
      // overwrite fields that weren't included in the request.
      const existing = videosRepo.getConfigForVideo(req.params.id);
      videosRepo.upsertConfig({
        videoId: req.params.id,
        model: config.model ?? existing?.model,
        partitionType: config.partitionType ?? existing?.partition_type,
        partitionInterval: config.partitionInterval ?? existing?.partition_interval,
        frameRate: config.frameRate ?? existing?.frame_rate,
        numPartitions: config.numPartitions ?? existing?.num_partitions,
        prompt: config.prompt ?? existing?.prompt,
        detail: config.detail ?? existing?.detail,
      });
    }

    if (result) {
      videosRepo.upsertResult(
        req.params.id,
        result.videoPath,
        result.totalFrames,
        result.frames,
      );
    }

    res.json({
      id: video.id,
      name: video.name,
      size: video.size,
      duration: video.duration,
      uploadedPath: video.uploaded_path,
      createdAt: video.created_at,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update video', details: error.message });
  }
};

/**
 * DELETE /videos/:id — delete video record and its file on disk
 */
export const removeVideo = (req: Request, res: Response) => {
  try {
    const video = videosRepo.getVideoById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    // Delete the physical file if it exists
    if (video.uploaded_path) {
      try { deleteFile(video.uploaded_path); } catch { /* ignore */ }
    }

    videosRepo.deleteVideo(req.params.id);
    res.json({ message: 'Video deleted', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete video', details: error.message });
  }
};
