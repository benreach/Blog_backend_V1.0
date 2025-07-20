import express from 'express';
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
} from '../controllers/bannerController.js';
import upload from '../middleware/upload.js';
import { admin, authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createBannerSchema, updateBannerSchema } from '../models/bannerSchema.js';


const router = express.Router();

router.post('/',authenticateToken,admin,upload.single("imageUrl"),validate(createBannerSchema), createBanner);
router.get('/', getBanners);
router.get('/:id', getBannerById);
router.put('/:id',authenticateToken,admin,upload.single("imageUrl"),validate(updateBannerSchema), updateBanner);
router.delete('/:id',authenticateToken,admin, deleteBanner);

export default router;
