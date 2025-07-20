import prisma from '../utils/prisma.js';

// Block a user
export const blockUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'blocked' },
    });

    res.json({ message: `User ${user.email} blocked successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to block user', error: err.message });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'active' },
    });

    res.json({ message: `User ${user.email} unblocked successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unblock user', error: err.message });
  }
};

// Soft-delete a user
export const softDeleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'deleted' },
    });

    res.json({ message: `User ${user.email} deleted (soft) successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// Restore a soft-deleted user
export const restoreUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.status !== 'deleted') {
      return res.status(400).json({ message: 'User is not deleted' });
    }

    const restoredUser = await prisma.user.update({
      where: { id },
      data: { status: 'active' },
    });

    res.json({ message: 'User restored', user: restoredUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to restore user', error: error.message });
  }
};


// Hard Delete 

export const hardDeleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Begin transaction for atomic delete
    await prisma.$transaction(async (prisma) => {
      // Delete comments
      await prisma.comment.deleteMany({
        where: { userId },
      });

      // Delete likes
      await prisma.like.deleteMany({
        where: { userId },
      });

      // Delete playlists
      await prisma.playlist.deleteMany({
        where: { userId },
      });

      // Delete admin profile if exists
      await prisma.adminProfile.deleteMany({
        where: { userId },
      });

      // Finally delete user
      await prisma.user.delete({
        where: { id: userId },
      });
    });

    res.json({ message: 'User and related data hard deleted successfully.' });
  } catch (err) {
    console.error('Hard delete user error:', err);
    res.status(500).json({
      message: 'Failed to hard delete user',
      error: err.message,
    });
  }
};


export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id; // user ID from auth middleware
    const {
      coverImage,
      profileIcon,
      description,
      facebook,
      twitter,
      instagram,
      youtube,
      website,
      linkedIn,
    } = req.body;

    const updatedProfile = await prisma.adminProfile.upsert({
      where: { userId },
      update: {
        ...(coverImage !== undefined && { coverImage }),
        ...(profileIcon !== undefined && { profileIcon }),
        ...(description !== undefined && { description }),
        ...(facebook !== undefined && { facebook }),
        ...(twitter !== undefined && { twitter }),
        ...(instagram !== undefined && { instagram }),
        ...(youtube !== undefined && { youtube }),
        ...(website !== undefined && { website }),
        ...(linkedIn !== undefined && { linkedIn }),
      },
      create: {
        userId,
        coverImage,
        profileIcon,
        description,
        facebook,
        twitter,
        instagram,
        youtube,
        website,
        linkedIn,
        followers: 0, // default value for new profile
      },
    });

    res.json({ message: 'Admin profile updated successfully', data: updatedProfile });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
