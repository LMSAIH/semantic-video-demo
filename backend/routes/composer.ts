import { Router } from 'express';
import {
  listPresets,
  listCompositions,
  generateComposition,
  getComposition,
  removeComposition,
} from '../controllers/composerController';

const router = Router();

// List available presets
router.get('/presets', listPresets);

// List compositions for a video
router.get('/:videoId', listCompositions);

// Generate a new composition
router.post('/generate', generateComposition);

// Get a single composition
router.get('/composition/:id', getComposition);

// Delete a composition
router.delete('/composition/:id', removeComposition);

export default router;
