import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory buffer
const upload = multer({ storage });

export default uploadBanner;
