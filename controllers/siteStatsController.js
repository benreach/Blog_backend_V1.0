import prisma from '../utils/prisma.js';

export const getSiteStats = async (req, res) => {
  try {
    // SiteStats id is fixed as "global" per your schema
    const stats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      return res.status(404).json({ message: 'Site stats not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching site stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
