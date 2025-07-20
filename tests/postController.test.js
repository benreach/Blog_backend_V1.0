import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

let prisma;
let postController;
const app = express();
app.use(express.json());

beforeAll(async () => {
  // Mock prisma before importing controller or prisma
  await jest.unstable_mockModule('../utils/prisma.js', () => {
    return {
      default: {
        post: {
          create: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          delete: jest.fn(),
          update: jest.fn(),
        },
        siteStats: {
          upsert: jest.fn(),
        },
      },
    };
  });

  // Import after mocking
  prisma = (await import('../utils/prisma.js')).default;
  postController = await import('../controllers/postController.js');

  // Setup routes
  app.post('/posts', postController.createPost);
  app.get('/posts', postController.getPosts);
  app.delete('/posts/:id', postController.deletePost);
  app.put('/posts/:id', postController.updatePost);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Post Controller', () => {
  describe('createPost', () => {
    it('should create a post and increment stats', async () => {
      prisma.post.create.mockResolvedValue({
        id: 'post1',
        title: 'Test Title',
        category: 'TECH',
        contentUrl: 'http://example.com',
      });

      prisma.siteStats.upsert.mockResolvedValue({});

      const res = await request(app)
        .post('/posts')
        .send({ title: 'Test Title', category: 'tech', contentUrl: 'http://example.com' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id', 'post1');
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { title: 'Test Title', category: 'TECH', contentUrl: 'http://example.com' },
      });
      expect(prisma.siteStats.upsert).toHaveBeenCalledWith({
        where: { id: 'global' },
        update: { totalPosts: { increment: 1 } },
        create: expect.any(Object),
      });
    });

    it('should return 400 if missing fields', async () => {
      const res = await request(app).post('/posts').send({ title: 'Only title' });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing required fields');
    });

    it('should handle errors gracefully', async () => {
      prisma.post.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/posts')
        .send({ title: 'Test', category: 'tech', contentUrl: 'url' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Failed to create post');
      expect(res.body).toHaveProperty('error', 'DB error');
    });
  });

  // ... (rest of your describe blocks exactly as you wrote)
});
