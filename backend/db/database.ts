import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'studio.db');

// Ensure data directory exists
import { ensureDirectoryExists } from '../utils/fileUtils';
ensureDirectoryExists(path.dirname(DB_PATH));

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    size          TEXT NOT NULL,
    duration      REAL,
    uploaded_path TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analysis_configs (
    video_id           TEXT PRIMARY KEY,
    model              TEXT NOT NULL DEFAULT 'gpt-5-nano',
    partition_type     TEXT NOT NULL DEFAULT 'time',
    partition_interval REAL NOT NULL DEFAULT 2,
    frame_rate         INTEGER NOT NULL DEFAULT 60,
    num_partitions     INTEGER DEFAULT 10,
    prompt             TEXT NOT NULL DEFAULT 'Describe what is happening in this frame in detail.',
    detail             TEXT NOT NULL DEFAULT 'auto',
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analysis_results (
    video_id     TEXT PRIMARY KEY,
    video_path   TEXT NOT NULL,
    total_frames INTEGER NOT NULL,
    frames_json  TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS embeddings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id     TEXT NOT NULL,
    frame_number INTEGER NOT NULL,
    timestamp    REAL NOT NULL DEFAULT 0,
    text         TEXT NOT NULL,
    embedding    TEXT NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_embeddings_video ON embeddings(video_id);

  CREATE TABLE IF NOT EXISTS compositions (
    id         TEXT PRIMARY KEY,
    video_id   TEXT NOT NULL,
    preset     TEXT NOT NULL,
    model      TEXT NOT NULL,
    content    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_compositions_video ON compositions(video_id);
`);

export default db;
