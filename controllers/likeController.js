import prisma from '../utils/prisma.js';

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const like = await prisma.like.create({
      data: { postId, userId },
    });

    res.status(201).json(like);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'You already liked this post' });
    }
    res.status(500).json({ message: 'Failed to like post', error: err.message });
  }
};

export const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.like.deleteMany({
      where: { postId, userId },
    });

    res.json({ message: 'Like removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove like', error: err.message });
  }
};

export const getLikesCount = async (req, res) => {
  const { postId } = req.params;

  try {
    const count = await prisma.like.count({ where: { postId } });
    res.json({ postId, likes: count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get likes count', error: err.message });
  }
};
