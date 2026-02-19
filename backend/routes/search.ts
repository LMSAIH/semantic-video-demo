import { Router } from 'express';
import * as searchController from '../controllers/searchController';

const router = Router();

// POST /search — semantic search across all frame descriptions
router.post('/', searchController.search);

// POST /search/generate — generate embeddings for a video
router.post('/generate', searchController.generateEmbeddings);

// DELETE /search/embeddings/:videoId — remove embeddings for a video
router.delete('/embeddings/:videoId', searchController.deleteEmbeddings);

// GET /search/status/:videoId — check if a video has embeddings
router.get('/status/:videoId', searchController.embeddingStatus);

export default router;
