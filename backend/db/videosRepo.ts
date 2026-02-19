import db from '../db/database';

/* ------------------------------------------------------------------ */
/*  Row types                                                          */
/* ------------------------------------------------------------------ */

export interface VideoRow {
  id: string;
  name: string;
  size: string;
  duration: number | null;
  uploaded_path: string | null;
  created_at: string;
}

export interface AnalysisConfigRow {
  video_id: string;
  model: string;
  partition_type: string;
  partition_interval: number;
  frame_rate: number;
  num_partitions: number | null;
  prompt: string;
  detail: string;
}

export interface AnalysisResultRow {
  video_id: string;
  video_path: string;
  total_frames: number;
  frames_json: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Prepared statements                                                */
/* ------------------------------------------------------------------ */

const stmts = {
  // Videos
  getAllVideos:   db.prepare('SELECT * FROM videos ORDER BY created_at DESC'),
  getVideoById:  db.prepare('SELECT * FROM videos WHERE id = ?'),
  insertVideo:   db.prepare('INSERT INTO videos (id, name, size, duration, uploaded_path) VALUES (?, ?, ?, ?, ?)'),
  updateVideo:   db.prepare('UPDATE videos SET name = ?, size = ?, duration = ?, uploaded_path = ? WHERE id = ?'),
  deleteVideo:   db.prepare('DELETE FROM videos WHERE id = ?'),

  // Analysis configs
  getConfig:     db.prepare('SELECT * FROM analysis_configs WHERE video_id = ?'),
  getAllConfigs:  db.prepare('SELECT * FROM analysis_configs'),
  upsertConfig:  db.prepare(`
    INSERT INTO analysis_configs (video_id, model, partition_type, partition_interval, frame_rate, num_partitions, prompt, detail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(video_id) DO UPDATE SET
      model = excluded.model,
      partition_type = excluded.partition_type,
      partition_interval = excluded.partition_interval,
      frame_rate = excluded.frame_rate,
      num_partitions = excluded.num_partitions,
      prompt = excluded.prompt,
      detail = excluded.detail
  `),
  deleteConfig:  db.prepare('DELETE FROM analysis_configs WHERE video_id = ?'),

  // Analysis results
  getResult:     db.prepare('SELECT * FROM analysis_results WHERE video_id = ?'),
  getAllResults:  db.prepare('SELECT * FROM analysis_results'),
  upsertResult:  db.prepare(`
    INSERT INTO analysis_results (video_id, video_path, total_frames, frames_json)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(video_id) DO UPDATE SET
      video_path = excluded.video_path,
      total_frames = excluded.total_frames,
      frames_json = excluded.frames_json,
      created_at = datetime('now')
  `),
  deleteResult:  db.prepare('DELETE FROM analysis_results WHERE video_id = ?'),
};

/* ------------------------------------------------------------------ */
/*  Video CRUD                                                         */
/* ------------------------------------------------------------------ */

export function getAllVideos(): VideoRow[] {
  return stmts.getAllVideos.all() as VideoRow[];
}

export function getVideoById(id: string): VideoRow | undefined {
  return stmts.getVideoById.get(id) as VideoRow | undefined;
}

export function createVideo(video: {
  id: string;
  name: string;
  size: string;
  duration?: number;
  uploadedPath?: string;
}): VideoRow {
  stmts.insertVideo.run(video.id, video.name, video.size, video.duration ?? null, video.uploadedPath ?? null);
  return getVideoById(video.id)!;
}

export function updateVideo(id: string, updates: {
  name?: string;
  size?: string;
  duration?: number;
  uploadedPath?: string;
}): VideoRow | undefined {
  const existing = getVideoById(id);
  if (!existing) return undefined;

  stmts.updateVideo.run(
    updates.name ?? existing.name,
    updates.size ?? existing.size,
    updates.duration ?? existing.duration,
    updates.uploadedPath ?? existing.uploaded_path,
    id,
  );
  return getVideoById(id);
}

export function deleteVideo(id: string): boolean {
  const info = stmts.deleteVideo.run(id);
  return info.changes > 0;
}

/* ------------------------------------------------------------------ */
/*  Config CRUD                                                        */
/* ------------------------------------------------------------------ */

export function getConfigForVideo(videoId: string): AnalysisConfigRow | undefined {
  return stmts.getConfig.get(videoId) as AnalysisConfigRow | undefined;
}

export function getAllConfigs(): AnalysisConfigRow[] {
  return stmts.getAllConfigs.all() as AnalysisConfigRow[];
}

export function upsertConfig(config: {
  videoId: string;
  model?: string;
  partitionType?: string;
  partitionInterval?: number;
  frameRate?: number;
  numPartitions?: number;
  prompt?: string;
  detail?: string;
}): AnalysisConfigRow {
  stmts.upsertConfig.run(
    config.videoId,
    config.model ?? 'gpt-5-nano',
    config.partitionType ?? 'time',
    config.partitionInterval ?? 2,
    config.frameRate ?? 60,
    config.numPartitions ?? 10,
    config.prompt ?? 'Describe what is happening in this frame in detail.',
    config.detail ?? 'auto',
  );
  return getConfigForVideo(config.videoId)!;
}

export function deleteConfig(videoId: string): boolean {
  const info = stmts.deleteConfig.run(videoId);
  return info.changes > 0;
}

/* ------------------------------------------------------------------ */
/*  Result CRUD                                                        */
/* ------------------------------------------------------------------ */

export function getResultForVideo(videoId: string): AnalysisResultRow | undefined {
  return stmts.getResult.get(videoId) as AnalysisResultRow | undefined;
}

export function getAllResults(): AnalysisResultRow[] {
  return stmts.getAllResults.all() as AnalysisResultRow[];
}

export function upsertResult(videoId: string, videoPath: string, totalFrames: number, frames: any[]): AnalysisResultRow {
  stmts.upsertResult.run(videoId, videoPath, totalFrames, JSON.stringify(frames));
  return getResultForVideo(videoId)!;
}

export function deleteResult(videoId: string): boolean {
  const info = stmts.deleteResult.run(videoId);
  return info.changes > 0;
}

/* ------------------------------------------------------------------ */
/*  Composite: get full video with config + result                     */
/* ------------------------------------------------------------------ */

export interface FullVideo {
  video: VideoRow;
  config: AnalysisConfigRow | undefined;
  result: AnalysisResultRow | undefined;
}

export function getFullVideo(id: string): FullVideo | undefined {
  const video = getVideoById(id);
  if (!video) return undefined;
  return {
    video,
    config: getConfigForVideo(id),
    result: getResultForVideo(id),
  };
}

export function getAllFullVideos(): FullVideo[] {
  const videos = getAllVideos();
  return videos.map(video => ({
    video,
    config: getConfigForVideo(video.id),
    result: getResultForVideo(video.id),
  }));
}
