// Note: this has to be top-level for ESM support
import { jest } from '@jest/globals';

await jest.unstable_mockModule('../utils/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

await jest.unstable_mockModule('../utils/prisma.js', () => ({
  default: {
    post: {
      create: jest.fn(),
    },
  },
}));

await jest.unstable_mockModule('fs/promises', () => ({
  default: {
    unlink: jest.fn(),
  },
}));

// Now import the tested module *after* mocks are registered
const { uploadPostFile } = await import('../controllers/uploadController.js');
const cloudinary = await import('../utils/cloudinary.js');
const prisma = await import('../utils/prisma.js');
const fs = await import('fs/promises');

describe('uploadPostFile', () => {
  let req;
  let res;
  let statusMock;
  let jsonMock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    res = {
      status: statusMock,
      json: jsonMock,
    };

    req = {
      file: {
        path: '/tmp/fakefile.jpg',
      },
      body: {
        title: 'Test post',
        type: 'image',
      },
    };

    jest.clearAllMocks();
  });

  it('should return 400 if no file is uploaded', async () => {
    req.file = null;

    await uploadPostFile(req, res);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'No file uploaded' });
  });

  it('should upload file, create post, delete file, and return 201', async () => {
    const fakeCloudinaryResponse = { secure_url: 'https://cloudinary.com/fake.jpg' };
    cloudinary.default.uploader.upload.mockResolvedValue(fakeCloudinaryResponse);
    fs.default.unlink.mockResolvedValue();
    prisma.default.post.create.mockResolvedValue({
      id: 'postId123',
      title: req.body.title,
      type: req.body.type.toUpperCase(),
      contentUrl: fakeCloudinaryResponse.secure_url,
    });

    await uploadPostFile(req, res);

    expect(cloudinary.default.uploader.upload).toHaveBeenCalledWith(req.file.path, {
      folder: 'blog_posts',
      resource_type: 'auto',
    });

    expect(fs.default.unlink).toHaveBeenCalledWith(req.file.path);

    expect(prisma.default.post.create).toHaveBeenCalledWith({
      data: {
        title: req.body.title,
        type: req.body.type.toUpperCase(),
        contentUrl: fakeCloudinaryResponse.secure_url,
      },
    });

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      id: 'postId123',
      title: req.body.title,
      type: req.body.type.toUpperCase(),
      contentUrl: fakeCloudinaryResponse.secure_url,
    });
  });

  it('should return 500 and error message on failure', async () => {
    const error = new Error('Upload failed');
    cloudinary.default.uploader.upload.mockRejectedValue(error);

    await uploadPostFile(req, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Upload failed',
      error: error.message,
    });
  });
});
