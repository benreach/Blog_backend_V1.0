import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import config from './config/index.js';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import postRoutes from './routes/postRoutes.js';
import uploadRoutes from "./routes/uploadRoute.js";
import commentsRouter from './routes/commentRoutes.js';
import likesRoutes from './routes/likeRoutes.js';
import adminRoutes from './routes/adminRoute.js';
import siteStatsRoutes from "./routes/siteStats.route.js"
import announcementRoutes from './routes/announcementRoute.js';
import bannerRoutes from './routes/bannerRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import errorHandler from './middleware/errorHandler.js';



dotenv.config();
const app = express();

// Basic security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

app.use(cookieParser());

// Rate limiter - limits requests to 100 per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Serve static files if you still have any local uploads temporarily (consider removing later if fully on cloud)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/posts', postRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/comments', commentsRouter);
app.use('/api/likes', likesRoutes);
app.use('/admin/users', adminRoutes);
app.use('/api/sitestats', siteStatsRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/music', musicRoutes);

app.use(errorHandler);


const PORT = config.port || 6000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;