const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// const auth = require("../middlewares/authMiddleware");

// Route: GET /class/:classId/month/:date
// Desc: Download monthly attendance report (Excel)
// Params: classId, date (YYYY-MM)
router.get('/class/:classId/month/:date', /* auth, */ reportController.getMonthlyClassReport);

// Route: GET /session/:sessionId
// Desc: Get present/absent summary for a session
router.get('/session/:sessionId', /* auth, */ reportController.getSessionSummary);

// Route: GET /images/:id
// Desc: Get classroom image metadata/url
router.get('/images/:id', /* auth, */ reportController.getImageMetadata);

module.exports = router;
