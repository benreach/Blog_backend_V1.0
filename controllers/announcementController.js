import prisma from '../utils/prisma.js';

// Create an announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await prisma.announcement.create({
      data: { title, content },
    });
    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

// Get single announcement
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch announcement' });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { title, content },
    });
    res.json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update announcement' });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({
      where: { id },
    });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};
