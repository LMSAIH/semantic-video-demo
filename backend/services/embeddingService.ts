import * as embeddingsRepo from '../db/embeddingsRepo';

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

// Cache the pipeline so the model is only loaded once
let embedderPromise: Promise<any> | null = null;

async function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = (async () => {
      // Dynamic import because @xenova/transformers is ESM-only
      const { pipeline } = await import('@xenova/transformers');
      console.log(`[Embeddings] Loading model ${MODEL_NAME}...`);
      const extractor = await pipeline('feature-extraction', MODEL_NAME);
      console.log(`[Embeddings] Model loaded successfully`);
      return extractor;
    })();
  }
  return embedderPromise;
}

/**
 * Generate embeddings for an array of texts using the local HuggingFace model.
 * Returns an array of float arrays (one per input text).
 */
async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const embedder = await getEmbedder();

  const allEmbeddings: number[][] = [];
  // Process in small batches to avoid memory issues
  const batchSize = 32;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const output = await embedder(batch, { pooling: 'mean', normalize: true });
    for (let j = 0; j < batch.length; j++) {
      allEmbeddings.push(Array.from(output[j].data as Float32Array));
    }
  }

  return allEmbeddings;
}

/* ------------------------------------------------------------------ */
/*  Cosine similarity                                                  */
/* ------------------------------------------------------------------ */

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export interface FrameForEmbedding {
  frameNumber: number;
  timestamp: number;
  description: string;
}

/**
 * Generate and store embeddings for analysis results of a video.
 * Replaces any existing embeddings for that video.
 */
export async function generateEmbeddingsForVideo(
  videoId: string,
  frames: FrameForEmbedding[],
): Promise<number> {
  if (frames.length === 0) return 0;

  // Delete existing embeddings for this video
  embeddingsRepo.deleteEmbeddingsByVideo(videoId);

  // Generate embeddings for all frame descriptions
  const texts = frames.map(f => f.description);
  const embeddings = await getEmbeddings(texts);

  // Store in database
  const entries = frames.map((frame, i) => ({
    videoId,
    frameNumber: frame.frameNumber,
    timestamp: frame.timestamp,
    text: frame.description,
    embedding: embeddings[i],
  }));

  embeddingsRepo.insertManyEmbeddings(entries);
  return entries.length;
}

/**
 * Delete all embeddings for a video (called when a video is deleted).
 * Note: CASCADE DELETE also handles this, but this provides explicit control.
 */
export function deleteEmbeddingsForVideo(videoId: string): void {
  embeddingsRepo.deleteEmbeddingsByVideo(videoId);
}

export interface SearchResult {
  videoId: string;
  videoName: string;
  frameNumber: number;
  timestamp: number;
  description: string;
  similarity: number;
}

/**
 * Search across all video embeddings with a natural language query.
 * @param query - The search query text
 * @param threshold - Minimum cosine similarity (0–1). Higher = more strict matching.
 * @param limit - Max number of results to return
 */
export async function searchEmbeddings(
  query: string,
  threshold: number = 0.3,
  limit: number = 20,
): Promise<SearchResult[]> {
  // Get query embedding
  const [queryEmbedding] = await getEmbeddings([query]);

  // Get all stored embeddings
  const allEmbeddings = embeddingsRepo.getAllEmbeddingsWithVideoName();

  if (allEmbeddings.length === 0) return [];

  // Compute similarity for each embedding
  const results: SearchResult[] = [];
  for (const row of allEmbeddings) {
    const storedEmbedding: number[] = JSON.parse(row.embedding);
    const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);

    if (similarity >= threshold) {
      results.push({
        videoId: row.video_id,
        videoName: row.video_name,
        frameNumber: row.frame_number,
        timestamp: row.timestamp,
        description: row.text,
        similarity,
      });
    }
  }

  // Sort by similarity (highest first) and limit
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}

/**
 * Check if a video has embeddings generated.
 */
export function videoHasEmbeddings(videoId: string): boolean {
  const embeddings = embeddingsRepo.getEmbeddingsByVideo(videoId);
  return embeddings.length > 0;
}

/**
 * Pre-warm the model by loading it eagerly.
 * Call this at server startup for faster first search.
 */
export async function warmUpModel(): Promise<void> {
  try {
    await getEmbedder();
  } catch (err) {
    console.error('[Embeddings] Failed to pre-warm model:', err);
  }
}
