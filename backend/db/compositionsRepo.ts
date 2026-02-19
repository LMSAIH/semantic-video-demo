import db from './database';

/* ------------------------------------------------------------------ */
/*  Row type                                                           */
/* ------------------------------------------------------------------ */

export interface CompositionRow {
  id: string;
  video_id: string;
  preset: string;
  model: string;
  content: string;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Prepared statements                                                */
/* ------------------------------------------------------------------ */

const stmts = {
  getByVideo:    db.prepare('SELECT * FROM compositions WHERE video_id = ? ORDER BY created_at DESC'),
  getById:       db.prepare('SELECT * FROM compositions WHERE id = ?'),
  insert:        db.prepare('INSERT INTO compositions (id, video_id, preset, model, content) VALUES (?, ?, ?, ?, ?)'),
  update:        db.prepare('UPDATE compositions SET content = ? WHERE id = ?'),
  deleteById:    db.prepare('DELETE FROM compositions WHERE id = ?'),
  deleteByVideo: db.prepare('DELETE FROM compositions WHERE video_id = ?'),
};

/* ------------------------------------------------------------------ */
/*  CRUD                                                               */
/* ------------------------------------------------------------------ */

export function getCompositionsByVideo(videoId: string): CompositionRow[] {
  return stmts.getByVideo.all(videoId) as CompositionRow[];
}

export function getCompositionById(id: string): CompositionRow | undefined {
  return stmts.getById.get(id) as CompositionRow | undefined;
}

export function createComposition(composition: {
  id: string;
  videoId: string;
  preset: string;
  model: string;
  content: string;
}): CompositionRow {
  stmts.insert.run(
    composition.id,
    composition.videoId,
    composition.preset,
    composition.model,
    composition.content,
  );
  return getCompositionById(composition.id)!;
}

export function updateCompositionContent(id: string, content: string): CompositionRow | undefined {
  stmts.update.run(content, id);
  return getCompositionById(id);
}

export function deleteComposition(id: string): boolean {
  const info = stmts.deleteById.run(id);
  return info.changes > 0;
}

export function deleteCompositionsByVideo(videoId: string): number {
  const info = stmts.deleteByVideo.run(videoId);
  return info.changes;
}
