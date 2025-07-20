export const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF images are allowed.'));
  } else {
    cb(null, true);
  }
};

export const fileSizeLimit = 5 * 1024 * 1024; // 5MB

// Usage example with multer:
import multer from 'multer';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileSizeLimit },
  fileFilter,
});
