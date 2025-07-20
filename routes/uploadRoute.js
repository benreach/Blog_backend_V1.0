import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/auth.js';
import { uploadPostFile } from '../controllers/uploadController.js';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', protect, admin, upload.single('file'), uploadPostFile);

export default router;
