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

const imageFilter = (req, file, cb) => {
  const allowed = ['.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error('Only images allowed'));
  }
  cb(null, true);
};

const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { files: 4, fileSize: 5 * 1024 * 1024 }
});

module.exports = { uploadImages };
