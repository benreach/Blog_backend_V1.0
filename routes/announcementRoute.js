import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { admin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/',authenticateToken,admin, createAnnouncement);
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);
router.put('/:id', authenticateToken,admin, updateAnnouncement);
router.delete('/:id',authenticateToken,admin, deleteAnnouncement);

export default router;
