import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../utils/s3.js'; // your configured s3 instance
import dotenv from 'dotenv';

dotenv.config(); // ensure env variables are loaded

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    // Remove or comment out the acl line:
    // acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const timestamp = Date.now();
      const sanitizedFileName = file.originalname.replace(/\s+/g, '_');
      const fileName = `music/${timestamp}_${sanitizedFileName}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV are allowed.'));
    }
  },
});

export default upload;
