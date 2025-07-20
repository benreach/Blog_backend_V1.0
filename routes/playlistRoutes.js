import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { savePostToPlaylist, getUserPlaylist, removePostFromPlaylist } from '../controllers/playlistController.js';
import { validate } from '../middleware/validate.js';
import { playlistParamSchema, saveToPlaylistSchema } from '../models/playlistValidation.js';

const router = express.Router();

router.post('/', authenticateToken,validate(saveToPlaylistSchema), savePostToPlaylist);
router.get('/', authenticateToken, getUserPlaylist);
router.delete('/:postId', authenticateToken, validate(playlistParamSchema),removePostFromPlaylist);

export default router;
