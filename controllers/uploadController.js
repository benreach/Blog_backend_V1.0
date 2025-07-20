import cloudinary from '../utils/cloudinary.js';
import prisma from '../utils/prisma.js';
import fs from 'fs/promises';

export const uploadPostFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'blog_posts',
      resource_type: 'auto',
    });

    // Clean up temp file after upload
    await fs.unlink(req.file.path);

    // Create post record
    const post = await prisma.post.create({
      data: {
        title: req.body.title,
        type: req.body.type.toUpperCase(),
        contentUrl: result.secure_url,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
