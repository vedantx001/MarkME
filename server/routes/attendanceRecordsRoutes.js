const express = require('express');
const router = express.Router();
const attendanceRecordController = require('../controllers/attendanceRecordController');

// Update single record
router.put('/:sessionId/records/:recordId', attendanceRecordController.updateRecord);

// Bulk update records
router.put('/:sessionId/records', attendanceRecordController.bulkUpdateRecords);

module.exports = router;
