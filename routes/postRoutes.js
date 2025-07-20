import express from 'express';
import { authenticateToken, admin, protect } from '../middleware/auth.js';
import { createPost, getPosts, deletePost, updatePost } from '../controllers/postController.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema } from '../models/postValidation.js';

const router = express.Router();

router.post('/', authenticateToken, admin,validate(createPostSchema), createPost);
router.get('/', getPosts);
router.delete('/:id', protect, admin, deletePost);
router.put('/:id', authenticateToken, admin,validate(updatePostSchema), updatePost);


export default router;
