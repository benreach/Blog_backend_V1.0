import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // multer configured for memory storage
import { validate } from '../middleware/validate.js';
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '../models/commentValidation.js';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  upload.single('image'),
  validate(createCommentSchema),
  addComment
);

router.get('/:postId', validate(getCommentsSchema), getCommentsByPost);

router.put('/:id', authenticateToken, validate(updateCommentSchema), updateComment);

router.delete('/:id', authenticateToken, deleteComment);

export default router;
