// /server/middlewares/uploadMiddleware.js
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.endsWith(".xlsx")) {
    return cb(new Error("Only .xlsx Excel files allowed"), false);
  }
  cb(null, true);
};

const uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
      return cb(new Error("Only .xlsx Excel files allowed"), false);
    }
    cb(null, true);
  }
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files (jpg, jpeg, png) allowed"), false);
    }
    cb(null, true);
  }
});

module.exports = {
  uploadExcel,
  uploadImage
};
