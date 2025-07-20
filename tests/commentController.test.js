import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

let prisma, cloudinary, commentController;

const app = express();
app.use(express.json());

// Mock Multer file upload
app.use((req, res, next) => {
  req.user = { id: 'user1' }; // Mock user from auth middleware
  next();
});

beforeAll(async () => {
  await jest.unstable_mockModule('../utils/prisma.js', () => ({
    default: {
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    },
  }));

  await jest.unstable_mockModule('../utils/cloudinary.js', () => ({
    default: {
      uploader: {
        upload_stream: jest.fn(),
      },
    },
  }));

  await jest.unstable_mockModule('streamifier', () => ({
    default: {
      createReadStream: jest.fn().mockReturnValue({
        pipe: jest.fn(),
      }),
    },
  }));

  prisma = (await import('../utils/prisma.js')).default;
  cloudinary = (await import('../utils/cloudinary.js')).default;
  commentController = await import('../controllers/commentController.js');

  app.post('/comments', commentController.addComment);
  app.get('/comments/:postId', commentController.getCommentsByPost);
  app.put('/comments/:id', commentController.updateComment);
  app.delete('/comments/:id', commentController.deleteComment);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Comment Controller', () => {
  describe('addComment', () => {
    it('should return 400 if no postId', async () => {
      const res = await request(app).post('/comments').send({ content: 'test' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'postId is required');
    });

    it('should return 400 if neither content nor image provided', async () => {
      const res = await request(app).post('/comments').send({ postId: 'p1' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Either content or image is required');
    });

    it('should create comment with content only', async () => {
      prisma.comment.create.mockResolvedValue({
        id: 'c1',
        content: 'Test comment',
        postId: 'p1',
        userId: 'user1',
      });

      const res = await request(app).post('/comments').send({
        postId: 'p1',
        content: 'Test comment',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 'c1');
      expect(prisma.comment.create).toHaveBeenCalledWith({
        data: {
          postId: 'p1',
          content: 'Test comment',
          imageUrl: null,
          userId: 'user1',
        },
      });
    });

    it('should handle errors', async () => {
      prisma.comment.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/comments').send({
        postId: 'p1',
        content: 'fail',
      });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to add comment');
    });
  });

  describe('getCommentsByPost', () => {
    it('should fetch comments with pagination', async () => {
      prisma.comment.count.mockResolvedValue(2);
      prisma.comment.findMany.mockResolvedValue([
        { id: 'c1', content: 'A' },
        { id: 'c2', content: 'B' },
      ]);

      const res = await request(app).get('/comments/p1?page=1&limit=2');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalPages', 1);
      expect(res.body.comments.length).toBe(2);
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { postId: 'p1' },
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
        skip: 0,
        take: 2,
      });
    });

    it('should handle errors', async () => {
      prisma.comment.count.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/comments/p1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to fetch comments');
    });
  });

  describe('updateComment', () => {
    it('should return 400 if no content provided', async () => {
      const res = await request(app).put('/comments/c1').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Content is required');
    });

    it('should return 404 if comment not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      const res = await request(app).put('/comments/c1').send({ content: 'Update' });
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Comment not found');
    });

    it('should return 403 if user not owner', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });
      const res = await request(app).put('/comments/c1').send({ content: 'Update' });
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to edit this comment');
    });

    it('should update comment', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user1' });
      prisma.comment.update.mockResolvedValue({ id: 'c1', content: 'Updated' });

      const res = await request(app).put('/comments/c1').send({ content: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('content', 'Updated');
    });

    it('should handle errors', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user1' });
      prisma.comment.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/comments/c1').send({ content: 'Updated' });
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to update comment');
    });
  });

  describe('deleteComment', () => {
    it('should return 404 if comment not found', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      const res = await request(app).delete('/comments/c1');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Comment not found');
    });

    it('should return 403 if not owner or admin', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'other' });
      const res = await request(app).delete('/comments/c1');
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to delete this comment');
    });

    it('should delete comment if owner', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user1' });
      prisma.comment.delete.mockResolvedValue({});

      const res = await request(app).delete('/comments/c1');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
    });

    it('should handle errors', async () => {
      prisma.comment.findUnique.mockResolvedValue({ id: 'c1', userId: 'user1' });
      prisma.comment.delete.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/comments/c1');
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to delete comment');
    });
  });
});
