const multer = require('multer');
const path = require('path');

// Configure storage
const os = require('os');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Complies with ephemeral hosting constraints (Railway/Render)
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and Excel files are allowed.'), false);
  }
};

const excelFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];

  // Also check extension strictly because mimetypes can vary
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || ext === '.xlsx') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .xlsx Excel files are allowed.'), false);
  }
};

const zipFileFilter = (req, file, cb) => {
  const allowedZipTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip',
    'application/octet-stream' // Sometimes zips come as this
  ];

  // Also check extension as fallback
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedZipTypes.includes(file.mimetype) || ext === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only ZIP files are allowed.'), false);
  }
};

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize upload for zip (memory)
const uploadZipStorage = multer({
  storage: memoryStorage,
  fileFilter: zipFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for bulk zip
  }
});

// Initialize upload for classroom image (disk or memory? Cloudinary helper usually takes buffer, so memory is better)
// Wait, uploadToCloudinary takes BUFFER.
// Currently 'upload' uses 'storage' which is DiskStorage.
// 'uploadImage' uses 'upload' (DiskStorage).
// BUT 'uploadToCloudinary' helper takes BUFFER.
// If 'upload' puts file on disk, req.file.buffer is UNDEFINED.
// So 'uploadImage' (array) might be broken for Cloudinary helper usage if it uses disk storage?
// Let's check studentController usage of uploadImage. It likely reads from path or something.
// BUT for processAttendance I wrote: `uploadToCloudinary(req.file.buffer, ...)`
// So I MUST use MemoryStorage.
// 'upload' uses DiskStorage.
// So I CANNOT use 'upload' for classroomImage if I expect buffer.
// I should use a new instance using MemoryStorage.

const uploadClassroomStorage = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const uploadExcelStorage = multer({
  storage: storage, // uses /tmp from os.tmpdir() defined above
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadImage = upload.array('images', 4);
const uploadExcel = uploadExcelStorage.single('excelFile');
const uploadZip = uploadZipStorage.single('file');
const uploadClassroomImage = uploadClassroomStorage.single('classroomImage'); // Backward compat (single image)
const uploadClassroomImages = uploadClassroomStorage.array('classroomImages', 4); // Preferred (1-4 images)

module.exports = {
  uploadImage,
  uploadExcel,
  uploadZip,
  uploadClassroomImage,
  uploadClassroomImages
};