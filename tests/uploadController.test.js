import { jest } from '@jest/globals';
import { Writable } from 'stream';

// Mock Cloudinary uploader.upload_stream with a writable stream mock
await jest.unstable_mockModule('../utils/cloudinary.js', () => {
  const upload_stream = jest.fn((options, callback) => {
    // Create a writable stream mock
    const writableStream = new Writable({
      write(chunk, encoding, cb) {
        // just consume the chunk
        cb();
      },
    });

    // Call the callback asynchronously to simulate upload success or failure
    setTimeout(() => {
      // For success:
      callback(null, { secure_url: 'https://cloudinary.com/fake.jpg' });
      // For failure, comment the above line and uncomment this:
      // callback(new Error('Upload failed'), null);
    }, 0);

    return writableStream;
  });

  return {
    default: {
      uploader: { upload_stream },
    },
  };
});

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
        buffer: Buffer.from('fake file data'),
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
    // Make sure prisma and fs mocks return as expected
    prisma.default.post.create.mockResolvedValue({
      id: 'postId123',
      title: req.body.title,
      type: req.body.type.toUpperCase(),
      contentUrl: 'https://cloudinary.com/fake.jpg',
    });
    fs.default.unlink.mockResolvedValue();

    await uploadPostFile(req, res);

    expect(cloudinary.default.uploader.upload_stream).toHaveBeenCalled();

    expect(fs.default.unlink).toHaveBeenCalledWith(req.file.path);

    expect(prisma.default.post.create).toHaveBeenCalledWith({
      data: {
        title: req.body.title,
        type: req.body.type.toUpperCase(),
        contentUrl: 'https://cloudinary.com/fake.jpg',
      },
    });

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      id: 'postId123',
      title: req.body.title,
      type: req.body.type.toUpperCase(),
      contentUrl: 'https://cloudinary.com/fake.jpg',
    });
  });

  it('should return 500 and error message on failure', async () => {
    // Override upload_stream mock to simulate error
    cloudinary.default.uploader.upload_stream.mockImplementation((options, callback) => {
      const writableStream = new Writable({
        write(chunk, encoding, cb) {
          cb();
        },
      });

      setTimeout(() => {
        callback(new Error('Upload failed'), null);
      }, 0);

      return writableStream;
    });

    await uploadPostFile(req, res);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: 'Upload failed',
      error: 'Upload failed',
    });
  });
});
