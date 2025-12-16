// /server/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const excelFilter = (req, file, cb) => {
  if (!file || !file.originalname) {
    return cb(new Error('Invalid file'), false);
  }
  if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
    return cb(new Error('Only .xlsx Excel files allowed'), false);
  }
  cb(null, true);
};

const imageFilter = (req, file, cb) => {
  if (!file || !file.originalname) {
    return cb(new Error('Invalid file'), false);
  }
  const allowed = ['.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only image files (png, jpg, jpeg) allowed'), false);
  }
  cb(null, true);
};

const uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: excelFilter
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { files: 4, fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadExcel,
  uploadImage,
  uploadImages
};
