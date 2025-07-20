import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

let prisma;
let adminController;

const app = express();
app.use(express.json());

beforeAll(async () => {
  await jest.unstable_mockModule('../utils/prisma.js', () => {
    return {
      default: {
        user: {
          update: jest.fn(),
          findUnique: jest.fn(),
          delete: jest.fn(),
        },
        comment: { deleteMany: jest.fn() },
        like: { deleteMany: jest.fn() },
        playlist: { deleteMany: jest.fn() },
        adminProfile: {
          deleteMany: jest.fn(),
          upsert: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(prisma)),
      },
    };
  });

  prisma = (await import('../utils/prisma.js')).default;
  adminController = await import('../controllers/adminController.js');

  // Routes setup
  app.patch('/users/block/:userId', adminController.blockUser);
  app.patch('/users/unblock/:userId', adminController.unblockUser);
  app.patch('/users/soft-delete/:userId', adminController.softDeleteUser);
  app.patch('/users/restore/:id', adminController.restoreUser);
  app.delete('/users/hard-delete/:userId', adminController.hardDeleteUser);
  app.put('/admin/profile', (req, res, next) => {
    req.user = { id: 'admin1' }; // mock auth middleware
    next();
  }, adminController.updateAdminProfile);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Admin/User Controller', () => {

  it('should block a user', async () => {
    prisma.user.update.mockResolvedValue({ email: 'test@example.com' });
    const res = await request(app).patch('/users/block/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User test@example.com blocked successfully.');
  });

  it('should unblock a user', async () => {
    prisma.user.update.mockResolvedValue({ email: 'test@example.com' });
    const res = await request(app).patch('/users/unblock/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User test@example.com unblocked successfully.');
  });

  it('should soft delete a user', async () => {
    prisma.user.update.mockResolvedValue({ email: 'test@example.com' });
    const res = await request(app).patch('/users/soft-delete/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User test@example.com deleted (soft) successfully.');
  });

  it('should restore a soft deleted user', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user1', status: 'deleted' });
    prisma.user.update.mockResolvedValue({ id: 'user1', status: 'active' });

    const res = await request(app).patch('/users/restore/user1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User restored');
  });

  it('should return 404 if user not found on restore', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).patch('/users/restore/user1');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('should return 400 if user is not deleted on restore', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user1', status: 'active' });
    const res = await request(app).patch('/users/restore/user1');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User is not deleted');
  });

  it('should hard delete user and related data', async () => {
    const res = await request(app).delete('/users/hard-delete/user123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User and related data hard deleted successfully.');
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should update admin profile', async () => {
    prisma.adminProfile.upsert.mockResolvedValue({ userId: 'admin1', description: 'Updated' });
    const res = await request(app)
      .put('/admin/profile')
      .send({ description: 'Updated' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Admin profile updated successfully');
    expect(res.body.data).toHaveProperty('description', 'Updated');
  });

});
