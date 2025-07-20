import cloudinary from '../utils/cloudinary.js';
import prisma from '../utils/prisma.js';
import streamifier from 'streamifier';

export const uploadPostFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload buffer to Cloudinary via stream
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'blog_posts',
            resource_type: 'auto',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

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
