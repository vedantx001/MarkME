const express = require('express');
const router = express.Router();
const attendanceSessionController = require('../controllers/attendanceSessionController');

// // authMiddleware goes here

// Fetch or create a session
router.post('/', attendanceSessionController.fetchOrCreateSession);

// Get session details
router.get('/:id', attendanceSessionController.getSessionDetails);

module.exports = router;
