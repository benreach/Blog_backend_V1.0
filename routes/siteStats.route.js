import express from 'express';
import { getSiteStats } from '../controllers/siteStatsController.js';

const router = express.Router();

router.get('/', getSiteStats);

export default router;
