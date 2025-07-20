import multer from 'multer';

const storage = multer.memoryStorage(); // store file in memory buffer

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for comments'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
