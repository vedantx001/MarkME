const express = require('express');
const router = express.Router();
const attendanceSessionController = require('../controllers/attendanceSessionController');
const attendanceController = require('../controllers/attendanceController');
const { uploadClassroomImage } = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');


// Fetch or create a session
router.post('/', attendanceSessionController.fetchOrCreateSession);

// Get session details
router.get('/:id', attendanceSessionController.getSessionDetails);

// Process attendance via AI
router.post('/process', authMiddleware, uploadClassroomImage, attendanceController.processAttendance);

module.exports = router;
