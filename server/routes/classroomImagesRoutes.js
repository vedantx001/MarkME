const express = require('express');
const router = express.Router();
const classroomImageController = require('../controllers/classroomImageController');

const { uploadImage } = require('../middlewares/uploadMiddleware');

// Route to upload session images
router.post('/:sessionId/images', uploadImage, classroomImageController.uploadSessionImages);

module.exports = router;
