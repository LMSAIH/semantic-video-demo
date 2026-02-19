import db from '../db/database';

/* ------------------------------------------------------------------ */
/*  Row types                                                          */
/* ------------------------------------------------------------------ */

export interface EmbeddingRow {
  id: number;
  video_id: string;
  frame_number: number;
  timestamp: number;
  text: string;
  embedding: string; // JSON-encoded float array
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Prepared statements                                                */
/* ------------------------------------------------------------------ */

const stmts = {
  insert: db.prepare(`
    INSERT INTO embeddings (video_id, frame_number, timestamp, text, embedding)
    VALUES (?, ?, ?, ?, ?)
  `),
  deleteByVideo: db.prepare('DELETE FROM embeddings WHERE video_id = ?'),
  getByVideo: db.prepare('SELECT * FROM embeddings WHERE video_id = ?'),
  getAll: db.prepare('SELECT * FROM embeddings'),
  getAllWithVideoName: db.prepare(`
    SELECT e.*, v.name as video_name
    FROM embeddings e
    JOIN videos v ON e.video_id = v.id
  `),
};

/* ------------------------------------------------------------------ */
/*  CRUD                                                               */
/* ------------------------------------------------------------------ */

export function insertEmbedding(
  videoId: string,
  frameNumber: number,
  timestamp: number,
  text: string,
  embedding: number[],
): void {
  stmts.insert.run(videoId, frameNumber, timestamp, text, JSON.stringify(embedding));
}

export function insertManyEmbeddings(
  entries: Array<{
    videoId: string;
    frameNumber: number;
    timestamp: number;
    text: string;
    embedding: number[];
  }>,
): void {
  const insertMany = db.transaction((items: typeof entries) => {
    for (const item of items) {
      stmts.insert.run(
        item.videoId,
        item.frameNumber,
        item.timestamp,
        item.text,
        JSON.stringify(item.embedding),
      );
    }
  });
  insertMany(entries);
}

export function deleteEmbeddingsByVideo(videoId: string): boolean {
  const info = stmts.deleteByVideo.run(videoId);
  return info.changes > 0;
}

export function getEmbeddingsByVideo(videoId: string): EmbeddingRow[] {
  return stmts.getByVideo.all(videoId) as EmbeddingRow[];
}

export function getAllEmbeddings(): EmbeddingRow[] {
  return stmts.getAll.all() as EmbeddingRow[];
}

export interface EmbeddingWithVideoName extends EmbeddingRow {
  video_name: string;
}

export function getAllEmbeddingsWithVideoName(): EmbeddingWithVideoName[] {
  return stmts.getAllWithVideoName.all() as EmbeddingWithVideoName[];
}
