import prisma from '../utils/prisma.js';

export const savePostToPlaylist = async (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ message: 'postId is required' });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const playlistItem = await prisma.playlist.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    res.status(201).json(playlistItem);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Post already saved to playlist' });
    }
    res.status(500).json({ message: 'Failed to save post', error: err.message });
  }
};

export const getUserPlaylist = async (req, res) => {
  try {
    const playlist = await prisma.playlist.findMany({
      where: { userId: req.user.id },
      include: { post: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch playlist', error: err.message });
  }
};

export const removePostFromPlaylist = async (req, res) => {
  const { postId } = req.params;

  try {
    const deleted = await prisma.playlist.deleteMany({
      where: {
        userId: req.user.id,
        postId,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: 'Post not found in playlist' });
    }

    res.json({ message: 'Removed from playlist' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove post', error: err.message });
  }
};
