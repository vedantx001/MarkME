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

exports.uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});
