import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

let prisma;
let announcementController;

const app = express();
app.use(express.json());

beforeAll(async () => {
  await jest.unstable_mockModule('../utils/prisma.js', () => {
    return {
      default: {
        announcement: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    };
  });

  prisma = (await import('../utils/prisma.js')).default;
  announcementController = await import('../controllers/announcementController.js');

  // Setup routes
  app.post('/announcements', announcementController.createAnnouncement);
  app.get('/announcements', announcementController.getAnnouncements);
  app.get('/announcements/:id', announcementController.getAnnouncementById);
  app.put('/announcements/:id', announcementController.updateAnnouncement);
  app.delete('/announcements/:id', announcementController.deleteAnnouncement);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Announcement Controller', () => {

  describe('createAnnouncement', () => {
    it('should create an announcement', async () => {
      prisma.announcement.create.mockResolvedValue({
        id: '1',
        title: 'Test Title',
        content: 'Test Content',
      });

      const res = await request(app)
        .post('/announcements')
        .send({ title: 'Test Title', content: 'Test Content' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', '1');
      expect(prisma.announcement.create).toHaveBeenCalledWith({
        data: { title: 'Test Title', content: 'Test Content' },
      });
    });

    it('should handle errors', async () => {
      prisma.announcement.create.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/announcements')
        .send({ title: 'Test', content: 'Test' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to create announcement');
    });
  });

  describe('getAnnouncements', () => {
    it('should fetch all announcements', async () => {
      prisma.announcement.findMany.mockResolvedValue([
        { id: '1', title: 'A1', content: 'C1' },
        { id: '2', title: 'A2', content: 'C2' },
      ]);

      const res = await request(app).get('/announcements');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(prisma.announcement.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle errors', async () => {
      prisma.announcement.findMany.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/announcements');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch announcements');
    });
  });

  describe('getAnnouncementById', () => {
    it('should fetch single announcement by id', async () => {
      prisma.announcement.findUnique.mockResolvedValue({
        id: '1',
        title: 'Test',
        content: 'Test content',
      });

      const res = await request(app).get('/announcements/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', '1');
      expect(prisma.announcement.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 404 if announcement not found', async () => {
      prisma.announcement.findUnique.mockResolvedValue(null);
      const res = await request(app).get('/announcements/99');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Announcement not found');
    });

    it('should handle errors', async () => {
      prisma.announcement.findUnique.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/announcements/1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch announcement');
    });
  });

  describe('updateAnnouncement', () => {
    it('should update an announcement', async () => {
      prisma.announcement.update.mockResolvedValue({
        id: '1',
        title: 'Updated Title',
        content: 'Updated Content',
      });

      const res = await request(app)
        .put('/announcements/1')
        .send({ title: 'Updated Title', content: 'Updated Content' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Updated Title');
      expect(prisma.announcement.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { title: 'Updated Title', content: 'Updated Content' },
      });
    });

    it('should handle errors', async () => {
      prisma.announcement.update.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .put('/announcements/1')
        .send({ title: 'Fail', content: 'Fail' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to update announcement');
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete an announcement', async () => {
      prisma.announcement.delete.mockResolvedValue({});
      const res = await request(app).delete('/announcements/1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Announcement deleted');
      expect(prisma.announcement.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle errors', async () => {
      prisma.announcement.delete.mockRejectedValue(new Error('DB error'));
      const res = await request(app).delete('/announcements/1');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete announcement');
    });
  });

});
