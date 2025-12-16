const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
// const auth = require('../middlewares/authMiddleware');

router.get('/session/:sessionId', reportController.sessionSummary);
router.get('/class/:classId/month/:month', reportController.classMonthlyReport);

module.exports = router;
