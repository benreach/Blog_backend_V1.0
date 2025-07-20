import prisma from '../utils/prisma.js';

async function main() {
  const existingStats = await prisma.siteStats.findUnique({ where: { id: 'global' } });
  if (!existingStats) {
    await prisma.siteStats.create({
      data: {
        id: 'global',
        totalUsers: 0,
        totalPosts: 0,
        totalMusic: 0,
        totalComments: 0,
        totalLikes: 0,
      },
    });
    console.log('SiteStats created');
  } else {
    console.log('SiteStats already exists');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
