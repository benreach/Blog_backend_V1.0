import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { likePost, unlikePost, getLikesCount } from '../controllers/likeController.js';

const router = express.Router();

router.post('/:postId', authenticateToken, likePost);
router.delete('/:postId', authenticateToken, unlikePost);
router.get('/:postId/count', getLikesCount);

export default router;
