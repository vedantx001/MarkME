const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

const uploadImage = upload.array('images', 4);
const uploadExcel = upload.single('file');
const uploadZip = uploadZipStorage.single('file');
const uploadClassroomImage = uploadClassroomStorage.single('classroomImage'); // For attendance marking

module.exports = {
  uploadImage,
  uploadExcel,
  uploadZip,
  uploadClassroomImage
};