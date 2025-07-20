import express from 'express';
import {
  createMusic,
  getAllMusic,
  getMusicById,
  updateMusic,
  deleteMusic,
} from '../controllers/musicController.js';

import upload from '../middleware/s3Bucket.js';
import { admin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',authenticateToken,admin,upload.single('music'), createMusic);
router.get('/', getAllMusic);
router.get('/:id', getMusicById);
router.put('/:id',authenticateToken,admin, updateMusic);
router.delete('/:id',authenticateToken,admin, deleteMusic);

export default router;
