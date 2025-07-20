import prisma from '../utils/prisma.js';
import cloudinary from '../utils/cloudinary.js';
import streamifier from 'streamifier';

// Helper to upload image buffer to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'comments' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const addComment = async (req, res) => {
  const { postId, content } = req.body;
  const imageFile = req.file;

  if (!postId) {
    return res.status(400).json({ message: 'postId is required' });
  }

  if (!content && !imageFile) {
    return res.status(400).json({ message: 'Either content or image is required' });
  }

  try {
    let imageUrl = null;

    if (imageFile) {
      const result = await uploadToCloudinary(imageFile.buffer);
      imageUrl = result.secure_url;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        content: content || null,
        imageUrl,
        userId: req.user.id,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalComments = await prisma.comment.count({ where: { postId } });

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            profileIcon: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalComments / limit);

    res.json({
      page,
      totalPages,
      totalComments,
      comments,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};


export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update comment', error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Allow deletion if user is owner or admin
    if (comment.userId !== req.user.id && req.user.id !== process.env.ADMIN_USER_ID) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { id } });

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete comment', error: err.message });
  }
};
